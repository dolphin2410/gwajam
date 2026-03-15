import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

async function checker(patches, data, id) {
    const id_patches = patches.filter(e => e[1] == id)

    const result = data.filter(row => 
        String(row['studid']).includes(id)
    );

    for (i of result) {
        i["hoodiecolor"] = "화이트 + 브라운"
        i["verified"] = "o"
        i["name"] = i["studid"].split(" ")[1]
    }

    // 색상 변경 결과 적용
    let used_patch = []

    for (patch of id_patches) {
        if (used_patch.includes(patch)) {
            continue
        }

        if (patch[2] == "CHANGE") {
            result.forEach(e => {
                if (e["hoodiesize"] == patch[3] && e["hoodiecolor"] == "화이트 + 브라운") {
                    e["hoodiecolor"] = patch[4]
                }
            })
        } else if (patch[2] == "NEW") {
            let verified = patch[6] || "확인 중"
            result.push({ name: patch[0], hoodie: "O", hoodiesize: patch[3], hoodiecolor: patch[4], verified })
        } else {
            continue
        }

        used_patch.push(patch)
    }

    return result
}

// Google Spreadsheet에서 후드집업 색상 변경 사항을 불러옵니다.
async function loadChanges() {
    const spreadsheetId = process.env.SHEET_ID;

    const apiKey = process.env.SHEETS_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/mainsheet?key=${apiKey}`;

    try {
        const response = await fetch(url)
        const rows = (await response.json()).values

        return rows.slice(1)
    } catch (error) {
        return []
    }
}

function handleData(data) {
    let jackets = []
    let hoodies = []

    for (item of data) {
        if (item["jacket"] == "O") {
            if (item["text"] === undefined) {
                item["text"] = ""
            }

            jackets.push({ size: item["jacketsize"], text: String(item["text"]), verified: item["verified"] })
        }

        if (item["hoodie"] == "O") {
            hoodies.push({ size: item["hoodiesize"], color: item["hoodiecolor"], verified: item["verified"] })
        }
    }

    return { jackets, hoodies }
}

exports.handler = async (event) => {
    const jsonBody = JSON.parse(event.body)
    const { pwd } = jsonBody

    if (pwd.replace(/\s/g, "") != process.env.PRIVATE_SECRET) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        }
    }
    
    // added
    let patches = await loadChanges()
    // added end

    try {
        // 과잠 + 후드티 데이터를 불러옵니다.
        const filePath = path.resolve(__dirname, 'data/sample.xlsx');
        
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const idnamelist = data.map(e => String(e['studid']).split(" "))
            .concat(patches.map(e => [String(e[1]), String(e[0])]))

        const idnameset = idnamelist.filter((item, pos) => {
            return idnamelist.indexOf(idnamelist.find(e => e[0] == item[0])) == pos
        })
        
        let totalData = []
        
        for (idname of idnameset) {
            let checkerData = await checker(patches, data, idname[0])

            const { jackets, hoodies } = handleData(checkerData)

            totalData.push({
                id: idname[0],
                name: idname[1],
                jackets,
                hoodies
            })
        }

        return {
            statusCode: 200,
            body: JSON.stringify(totalData),
        };
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to read data" }),
        };
    }
}