let title = document.getElementById("title")

let submitbtn = document.getElementById("submitbtn")
let studid = document.getElementById("studid")
let jackettable = document.getElementById("jackettable")
let results = document.getElementById("results")

let jackettitle = document.getElementById("jackettitle")

let bapsajuki = document.getElementById("bapsajuki")

submitbtn.addEventListener("click", () => {
    fetch("/.netlify/functions/checker", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            studid: studid.value,
            pwd: '마셔라온힘으로'
        })
    })
    .then(data => data.json())
    .then(handleData)
    .catch(e => {
        alert("암구호가 올바르지 않습니다")
    })
    
})

function handleData(data) {
    let jackets = []
    
    jackettable.innerHTML = `<tr><th>사이즈</th><th>가격</th><th>입금 확인</th></tr>`

    for (item of data) {
            jackets.push(item)
            jackettable.innerHTML += `<tr><td>${item["size"]}</td><td>${item["price"]}</td><td>${item["verified"]}</td></tr>`
    }

    jackettitle.style.display = "block"

    if(jackets.length == 0) {
        jackettable.innerHTML += `<tr><td>구매하지 않음</td><td></td></tr>`
    }
}


title.addEventListener("click", e => {
    studid.value = ""
    jackettitle.style.display = "none"
    jackettable.innerHTML = ``
    hoodietitle.style.display = "none"
    hoodietable.innerHTML = ``
})

let counter = 0

bapsajuki.addEventListener("click", e => {
    if (counter++ < 1) {
        alert("농담이고ㅋㅋㅋ 마음만 받겠습니다 ❤️")
    } else {
        window.location.href = "/platform975"
    }
})