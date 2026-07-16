const pwd = document.querySelector("#pwd")
const btn = document.querySelector("#btn")
const jacketbtn = document.querySelector("#jacketbtn")
const humanbtn = document.querySelector("#humanbtn")
const hoodiebtn = document.querySelector("#hoodiebtn")
const ghoodiebtn = document.querySelector("#ghoodiebtn")
const wphoodiebtn = document.querySelector("#wphoodiebtn")
const wbhoodiebtn = document.querySelector("#wbhoodiebtn")
const btns = [jacketbtn, hoodiebtn, ghoodiebtn, wphoodiebtn, wbhoodiebtn, humanbtn]

const soosang1 = document.querySelector("#soosang1")
const soosang2 = document.querySelector("#soosang2")
const soosang3 = document.querySelector("#soosang3")

function downloadFile(filename, content) {
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}

btn.addEventListener("click", async e => {
    const resp = await fetch("/.netlify/functions/stats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            pwd: pwd.value
        })
    })

    const data = await resp.json().catch(e => alert("감사합니다!"))

    let jacketdata = []
    data.forEach(e => {
        e.jackets.forEach(j => {
            jacketdata.push({ id: e.id, name: e.name, size: j.size, text: j.text, verified: j.verified })
        })
    })

    let hoodiedata = []
    data.forEach(e => {
        e.hoodies.forEach(h => {
            hoodiedata.push({ id: e.id, name: e.name, size: h.size, color: h.color, verified: h.verified })
        })
    })

    let raonlist = []
    data.forEach(e => raonlist.push({ year: String(e.id).substring(2, 4), name: e.name, quantity: e.jackets.length }))

    let grayhoodiedata = hoodiedata.filter(e => e.color == "그레이").map(e => ({ id: e.id, name: e.name, size: e.size, verified: e.verified }))
    let whitepinkhoodiedata = hoodiedata.filter(e => e.color == "화이트 + 핑크").map(e => ({ id: e.id, name: e.name, size: e.size, verified: e.verified }))
    let whitebrownhoodiedata = hoodiedata.filter(e => e.color == "화이트 + 브라운").map(e => ({ id: e.id, name: e.name, size: e.size, verified: e.verified }))

    btns.forEach(e => e.style.display = "block")

    humanbtn.addEventListener("click", e => {
        downloadFile("2026_raon_list.csv", jsonToCSV(["year", "name", "quantity"], raonlist))
    })

    jacketbtn.addEventListener("click", e => {
        downloadFile("2026_raon_jacket.csv", jsonToCSV(["id", "name", "size", "text", "verified"], jacketdata))
    })

    hoodiebtn.addEventListener("click", e => {
        downloadFile("2026_raon_hoodie.csv", jsonToCSV(["id", "name", "size", "color", "verified"], hoodiedata))
    })

    ghoodiebtn.addEventListener("click", e => {
        downloadFile("2026_raon_gray_hoodie.csv", jsonToCSV(["id", "name", "size", "verified"], grayhoodiedata))
    })

    wphoodiebtn.addEventListener("click", e => {
        downloadFile("2026_raon_white_pink_hoodie.csv", jsonToCSV(["id", "name", "size", "verified"], whitepinkhoodiedata))
    })

    wbhoodiebtn.addEventListener("click", e => {
        downloadFile("2026_raon_white_brown_hoodie.csv", jsonToCSV(["id", "name", "size", "verified"], whitebrownhoodiedata))
    })
})