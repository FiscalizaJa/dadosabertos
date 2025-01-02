import axios from "axios";
import jsdom from "jsdom";

// O módulo "wikipedia" estava com problemas para carregar esse artigo em específico, optei por fazer direto com axios.
// No futuro vou fazer um próprio ao invés de usar o "wikipedia", muitos bugs. Só não quero perder tempo com isso agora.
export default class WikipediaArticlesList {
    // ID do artigo na wikipedia com a lista de todos eles (interessa para nós o link dos artigos)
    static PARLAMENTARIANS_ARTICLE: string = "https://pt.wikipedia.org/api/rest_v1/page/html/Lista_de_senadores_do_Brasil_da_57.%C2%AA_legislatura"

    private Articles: Record<string, string> = {}

    async mountArticlesList() {
        if(Object.keys(this.Articles).length) {
            return this.Articles
        }

        const page = await axios.get<string>(WikipediaArticlesList.PARLAMENTARIANS_ARTICLE)
        const DOM = new jsdom.JSDOM(page.data)

        const links = DOM.window.document.querySelectorAll<HTMLLinkElement>("a[rel=\"mw:WikiLink\"]")
        links.forEach(link => {
            this.Articles[link.textContent] = link.href.slice(2) // tira o "./"
        })
        
        return this.Articles
    }
}