const { createBrowserClient } = require("@supabase/ssr");
try {
  const client = createBrowserClient("", "");
  console.log("Client created");
  client.auth.getSession().then(res => console.log("Session:", res)).catch(e => console.log("Session Error:", e));
} catch (e) {
  console.log("Init Error:", e);
}
