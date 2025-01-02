import wikipedia from "wikipedia";

wikipedia.setLang("pt")

function formatName(input: string) {
    const stringWithUnderscores = input.replace(/ /g, '_');

    return stringWithUnderscores;
}

export default async function get_parlamentarian_from_wikipedia({ parlamentarian_name }: { parlamentarian_name: string }) {
    const article_name = formatName(parlamentarian_name)
    console.log(article_name)

    const page = await wikipedia.page(article_name, {
        fields: [
            "summary",
            "related",
            "infobox"
        ]
    })
    
    const summary = await page.summary()
    return `
        Sumário do parlamentar na wikipedia:
        ${summary.extract}

        - Caso a pessoa descrita não corresponda ao parlamentar, diga que não o achou na wikipedia.
    `
}