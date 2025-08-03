// d:\Trae\backend\src\config\ai_models.ts

export const aiModelsConfig = {
  defaultProvider: "deepseek",
  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      models: {
        flash: "gemini-2.0-flash",
        pro: "gemini-2.5-pro-experimental",
      },
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      models: {
        chat: "deepseek-v3-chat",
        research: "deepseek-r1",
      },
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      models: {
        llama: "meta-llama-4-maverick",
        qwen: "qwen-3-235b-a22b",
      },
    },
  },
};
