export default function ConvertSpacesToUnderscores(input: string) {
    const stringWithUnderscores = input.replace(/ /g, '_');

    return stringWithUnderscores;
}