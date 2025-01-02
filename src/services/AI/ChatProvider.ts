import GeminiChatProvider from "./Models/Gemini/ChatProvider";

enum Provider {
    Gemini,
}

class ChatProvider {
    public client: GeminiChatProvider

    constructor(provider: Provider) {
        if(provider === Provider.Gemini) {
            this.client = new GeminiChatProvider()
        }

        if(!this.client) {
            throw new Error("Invalid provider.")
        }
    }
}

export {
    Provider
}

export default ChatProvider