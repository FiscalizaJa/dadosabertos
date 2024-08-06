export default function checkDateValidity(date: string) {
    return !isNaN(new Date(date) as any)
}