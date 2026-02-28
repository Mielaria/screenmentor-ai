import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEVEL_INSTRUCTIONS: Record<string, string> = {
  basico: `Responde de forma EXTREMADAMENTE detallada para un principiante total.
- Indica la ubicación exacta de cada botón ("En la barra superior", "En el panel derecho", "En la esquina inferior izquierda").
- No asumas conocimiento previo del software.
- Evita atajos de teclado, salvo que los expliques paso a paso.
- Usa lenguaje sencillo y amigable.`,
  intermedio: `Responde de forma directa y resumida para alguien con experiencia media.
- Omite explicaciones obvias.
- Usa terminología estándar del software.
- Mantén pasos claros pero concisos.
- Puedes mencionar atajos comunes.`,
  avanzado: `Responde de forma ultra concisa para un usuario experto.
- Prioriza atajos de teclado y comandos rápidos.
- Usa terminología técnica avanzada.
- Evita explicaciones básicas.
- Solo describe rutas de menú si es estrictamente necesario.`,
};

const SOFTWARE_CONTEXT: Record<string, string> = {
  photoshop: `Eres un experto en Adobe Photoshop. Las tareas soportadas son: eliminar fondo, recortar imagen, agregar texto, cambiar tamaño, exportar imagen.`,
  canva: `Eres un experto en Canva. Las tareas soportadas son: cambiar color de fondo, añadir texto, añadir elementos/objetos, modificar tamaño/tipografía, exportar diseño.`,
  shapr3d: `Eres un experto en Shapr3D. Las tareas soportadas son: crear boceto básico, modificar medidas (ancho, alto, largo), realizar extrusión, alinear objetos.`,
};

const OUT_OF_SCOPE_MSG =
  "Esta demo está optimizada para funciones específicas de Photoshop, Canva y Shapr3D.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("CLAVE_API_DE_OPENAI");
    if (!API_KEY) {
      throw new Error("CLAVE_API_DE_OPENAI is not configured");
    }

    const { image_base64, texto_transcrito, nivel_usuario, software_seleccionado } = await req.json();

    if (!texto_transcrito || !software_seleccionado || !nivel_usuario) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const softwareKey = software_seleccionado.toLowerCase();
    const levelKey = nivel_usuario.toLowerCase();

    const softwareCtx = SOFTWARE_CONTEXT[softwareKey];
    const levelInstr = LEVEL_INSTRUCTIONS[levelKey];

    if (!softwareCtx || !levelInstr) {
      return new Response(
        JSON.stringify({ steps: [OUT_OF_SCOPE_MSG] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `${softwareCtx}

${levelInstr}

INSTRUCCIONES DE FORMATO:
- Responde SIEMPRE en español.
- Genera una lista de pasos numerados claros.
- Cada paso debe ser una instrucción accionable.
- NO uses markdown. Solo texto plano con números.
- Si la solicitud del usuario NO corresponde a las tareas soportadas del software seleccionado, responde EXACTAMENTE: "${OUT_OF_SCOPE_MSG}"
- Si se proporciona una captura de pantalla, analízala para dar instrucciones contextuales basadas en lo que ves en pantalla.
- Responde SIEMPRE en texto plano, sin formato especial, sin markdown, sin negritas, sin asteriscos.`;

    // Build input for the Responses API using the correct "message" format
    const userContent: any[] = [];

    if (image_base64) {
      userContent.push({
        type: "input_image",
        image_url: `data:image/jpeg;base64,${image_base64}`,
        detail: "low",
      });
    }

    userContent.push({
      type: "input_text",
      text: `Software: ${software_seleccionado}\nNivel: ${nivel_usuario}\nSolicitud del usuario: ${texto_transcrito}`,
    });

    const input = [
      {
        role: "developer",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userContent,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input,
        max_output_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI Responses API error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Error al procesar con IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract text from the Responses API output
    const outputText = data.output
      ?.filter((item: any) => item.type === "message")
      ?.flatMap((item: any) => item.content)
      ?.filter((c: any) => c.type === "output_text")
      ?.map((c: any) => c.text)
      ?.join("\n") || OUT_OF_SCOPE_MSG;

    // Parse numbered steps
    const lines = outputText.split("\n").filter((l: string) => l.trim());
    const steps = lines.map((l: string) => l.replace(/^\d+[\.\)\-]\s*/, "").trim()).filter(Boolean);

    return new Response(
      JSON.stringify({ steps, raw: outputText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-screen error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
