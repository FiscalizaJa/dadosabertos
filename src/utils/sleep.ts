export default function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(time)
        }, time)
    })
}