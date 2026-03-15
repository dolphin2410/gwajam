import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Google Spreadsheet에서 후드집업 색상 변경 사항을 불러옵니다.
async function loadChanges(studid) {
    const spreadsheetId = process.env.SHEET_ID;

    const apiKey = process.env.SHEETS_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/mainsheet?key=${apiKey}`;

    try {
        const response = await fetch(url)
        const rows = (await response.json()).values

        let filtered = []

        // 학번 일치 정보 필터링
        for (row of rows) {
            if (row[1] == studid) {
                filtered.push(row)
            }
        }

        // timestamp 기준 sorting
        filtered.sort(a => a[5])

        return filtered
    } catch (error) {
        return []
    }
}

exports.handler = async (event) => {
    const jsonBody = JSON.parse(event.body)
    const { studid, pwd } = jsonBody
    
    // added
    let patches = await loadChanges(studid)
    // added end

    if (pwd.replace(/\s/g, "") != process.env.PUBLIC_SECRET) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        }
    }

    try {
        // 과잠 + 후드티 데이터를 불러옵니다.
        const filePath = path.resolve(__dirname, 'data/sample.xlsx');
        
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 학번 일치 정보 필터링
        const result = data.filter(row => 
            String(row['studid']).includes(studid)
        );

        // added

        // 색상 변경 이전 기본값
        for (i of result) {
            i["hoodiecolor"] = "화이트 + 브라운"
            i["verified"] = "o"
        }

        // 색상 변경 결과 적용
        let used_patch = []

        for (patch of patches) {
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
                console.log(patch)
                let verified = patch[6] || "확인 중"
                result.push({ hoodie: "O", hoodiesize: patch[3], hoodiecolor: patch[4], verified })
            } else {
                continue
            }

            used_patch.push(patch)
        }
        // added end

        if (!result) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Order not found." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to read data." }),
        };
    }
}