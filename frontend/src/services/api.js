
async function postRequest(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function sendMessage(message, history, language) {
  return postRequest("/api/chat", {
    message,
    history,
    language
  });
}

export async function generateComplaint(history, language) {
  return postRequest("/api/complaints/generate", {
    history,
    language
  });
}
