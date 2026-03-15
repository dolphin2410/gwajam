let title = document.getElementById("title")

let submitbtn = document.getElementById("submitbtn")
let studid = document.getElementById("studid")
let pwd = document.getElementById("pwd")
let jackettable = document.getElementById("jackettable")
let hoodietable = document.getElementById("hoodietable")
let results = document.getElementById("results")

let jackettitle = document.getElementById("jackettitle")
let hoodietitle = document.getElementById("hoodietitle")

let bapsajuki = document.getElementById("bapsajuki")

submitbtn.addEventListener("click", () => {
    fetch("/.netlify/functions/checker", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            studid: studid.value,
            pwd: pwd.value
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
    let hoodies = []
    
    jackettable.innerHTML = `<tr><th align="center">사이즈</th><th>이니셜</th><th>입금 확인</th></tr>`
    hoodietable.innerHTML = `<tr><th>사이즈</th><th>색상</th><th>입금 확인</th></tr>`

    for (item of data) {
        if (item["jacket"] == "O") {
            if (item["text"] === undefined) {
                item["text"] = ""
            }

            jackets.push({ size: item["jacketsize"], text: item["text"] })
            jackettable.innerHTML += `<tr><td>${item["jacketsize"]}</td><td>${item["text"]}</td><td>o</td></tr>`
        }

        if (item["hoodie"] == "O") {
            hoodies.push({ size: item["hoodiesize"], color: item["hoodiecolor"] })
            hoodietable.innerHTML += `<tr><td>${item["hoodiesize"]}</td><td>${item["hoodiecolor"]}</td><td>${item["verified"]}</td></tr>`
        }
    }

    jackettitle.style.display = "block"
    hoodietitle.style.display = "block"

    if(jackets.length == 0) {
        jackettable.innerHTML += `<tr><td>구매하지 않음</td><td></td></tr>`
    }

    if(hoodies.length == 0) {
        hoodietable.innerHTML += `<tr><td>구매하지 않음</td></tr>`
    }
}

title.addEventListener("click", e => {
    studid.value = ""
    pwd.value = ""
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