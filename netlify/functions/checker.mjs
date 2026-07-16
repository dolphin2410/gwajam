import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Google Spreadsheet에서 후드집업 색상 변경 사항을 불러옵니다.
async function loadSheets(studid) {
    const spreadsheetId = process.env.SHEET_ID;

    const apiKey = process.env.SHEETS_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/mainsheet?key=${apiKey}`;
    console.log('passed01')

    try {
        const response = await fetch(url)
        const rows = (await response.json()).values
    console.log('passed02')

        let filtered = []

        // 학번 일치 정보 필터링
        for (row of rows) {
            if (row[1] == studid) {
                filtered.push(row)
            }
        }

        // timestamp 기준 sorting
        filtered.sort(a => a[0])

        return filtered
    } catch (error) {
        console.error("Error loading data:", error);
        return []
    }
}

exports.handler = async (event) => {
    const jsonBody = JSON.parse(event.body)
    const { studid, pwd } = jsonBody

    const targetStudid = studid
    
    // added
    let data = await loadSheets(studid)
    // added end

    if (pwd.replace(/\s/g, "") != process.env.PUBLIC_SECRET) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        }
    }

    console.log('passed')

    try {
        const result = []
        console.log(data)
        for (row of data) {
            const studid = row[1]
            const name = row[2]
            const size = row[4]
            const price = row[5].match(/\d+원/)[0]
            const verified = row[7]
    console.log('passed2')

            result.push({
                studid,
                name,
                size,
                price,
                verified
            })
        }
        // added end

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error reading data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to read data." }),
        };
    }
}