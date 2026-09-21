const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbwz_1H5WeAAyfOhdAZekWef0Flhk0D6lL7ZmczjHWQ9P-0bkebCBad_1Lk8Ujc1hdM8/exec";

const offers = {
  iniciacion: {
    name: "INICIACIÓN",
    price: 79000,
  },
  avanzado: {
    name: "AVANZADO",
    price: 112900,
  },
  completo: {
    name: "TRATAMIENTO COMPLETO",
    price: 143900,
  },
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  try {
    let body;

    try {
      body = await context.request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Los datos del pedido no son válidos",
        },
        400,
      );
    }

    const {
      oferta,
      nombre,
      whatsapp,
      departamento,
      ciudad,
      direccion,
    } = body || {};

    if (
      !oferta ||
      !nombre ||
      !whatsapp ||
      !departamento ||
      !ciudad ||
      !direccion
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Todos los campos son obligatorios",
        },
        400,
      );
    }

    const cleanName = String(nombre).trim();
    const cleanWhatsapp = String(whatsapp).replace(/\D/g, "");
    const cleanDepartment = String(departamento).trim();
    const cleanCity = String(ciudad).trim();
    const cleanAddress = String(direccion).trim();

    if (cleanName.length < 3) {
      return jsonResponse(
        {
          success: false,
          message: "El nombre no es válido",
        },
        400,
      );
    }

    if (cleanWhatsapp.length < 7 || cleanWhatsapp.length > 15) {
      return jsonResponse(
        {
          success: false,
          message: "El número de WhatsApp no es válido",
        },
        400,
      );
    }

    if (cleanCity.length < 2) {
      return jsonResponse(
        {
          success: false,
          message: "La ciudad no es válida",
        },
        400,
      );
    }

    if (cleanAddress.length < 8) {
      return jsonResponse(
        {
          success: false,
          message: "La dirección no es válida",
        },
        400,
      );
    }

    const selectedOffer = offers[oferta];

    if (!selectedOffer) {
      return jsonResponse(
        {
          success: false,
          message: "La oferta seleccionada no es válida",
        },
        400,
      );
    }

    const order = {
      oferta,
      nombre: cleanName,
      whatsapp: cleanWhatsapp,
      departamento: cleanDepartment,
      ciudad: cleanCity,
      direccion: cleanAddress,
      total: selectedOffer.price,
    };

    const sheetsResponse = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    let sheetsResult;

    try {
      sheetsResult = await sheetsResponse.json();
    } catch {
      sheetsResult = null;
    }

    if (!sheetsResponse.ok || !sheetsResult?.success) {
      throw new Error(
        sheetsResult?.message || "No se pudo guardar el pedido en Google Sheets",
      );
    }

    const phone = context.env.CALLMEBOT_PHONE;
    const apiKey = context.env.CALLMEBOT_API_KEY;

    const whatsappMessage = `
🛒 *NUEVO PEDIDO FIBRA FIX*

📦 Oferta: ${selectedOffer.name}
👤 Cliente: ${order.nombre}
📱 WhatsApp: ${order.whatsapp}
📍 Departamento: ${order.departamento}
🏙️ Ciudad: ${order.ciudad}
🏠 Dirección: ${order.direccion}
💰 Total: $${order.total.toLocaleString("es-CO")}

✅ Estado: Nuevo
`.trim();

    if (phone && apiKey) {
      try {
        const callMeBotUrl =
          "https://api.callmebot.com/whatsapp.php" +
          `?phone=${encodeURIComponent(phone)}` +
          `&text=${encodeURIComponent(whatsappMessage)}` +
          `&apikey=${encodeURIComponent(apiKey)}`;

        const whatsappResponse = await fetch(callMeBotUrl);
        const callMeBotResult = await whatsappResponse.text();

        console.log("Estado CallMeBot:", whatsappResponse.status);
        console.log("Respuesta CallMeBot:", callMeBotResult);

        if (!whatsappResponse.ok) {
          console.error(
            "CallMeBot respondió con error:",
            whatsappResponse.status,
          );
        }
      } catch (whatsappError) {
        console.error(
          "No se pudo enviar la notificación de WhatsApp:",
          whatsappError.message,
        );
      }
    } else {
      console.warn(
        "CallMeBot no está configurado: faltan CALLMEBOT_PHONE o CALLMEBOT_API_KEY.",
      );
    }

    console.log("Pedido guardado en Google Sheets:", order);

    return jsonResponse(
      {
        success: true,
        message: "Pedido guardado correctamente",
        order,
      },
      201,
    );
  } catch (error) {
    console.error("Error guardando pedido:", error);

    return jsonResponse(
      {
        success: false,
        message: "No se pudo guardar el pedido",
      },
      500,
    );
  }
}

export function onRequest(context) {
  return jsonResponse(
    {
      success: false,
      message: "Método no permitido",
    },
    405,
  );
}
