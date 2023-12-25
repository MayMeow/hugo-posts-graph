import fs from "fs";
import path from "path";
import moment from "moment";

function readPublishedDate(filePath) {
    try {
        const file = fs.readFileSync(filePath, "utf-8");
        const match = file.match(/^date: (.*)$/m);

        return match[1];
    } catch (error) {
        console.log(error);
    }
}

function isPublished(filePath) {
    try {
        const file = fs.readFileSync(filePath, "utf-8");
        const match = file.match(/^draft: (.*)$/m);

        return match[1] === "false";
    } catch (error) {
        console.log(error);
    }
}

function processFiles($folderPath, $publishedDates) {
    let files = fs.readdirSync($folderPath);
    let publishedDates = $publishedDates;

    files.forEach((file) => {
        const filePath = path.join($folderPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            processFiles(filePath, publishedDates);
        } else if (file.toLowerCase() === "index.md") {
            if (isPublished(filePath)) {
                let publishedDate = readPublishedDate(filePath);
                publishedDates.push(publishedDate);
            }
        }
    });
    return publishedDates;
}

function getDates($folderPath) {
    let publishedDates = [];
    let dataForGraph = {};
    publishedDates = processFiles($folderPath, publishedDates);


    let dataObjects = publishedDates.map(item => {
        let year = moment(item).format("YYYY");
        return {
            [year]: {
                offset: moment(item).startOf('year').isoWeekday() - 1,
                days: ((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365,
                daysWithPost: []
            }
        };
    });
    dataForGraph = Object.assign({}, ...dataObjects);

    publishedDates.forEach(item => {
        let year = moment(item).format("YYYY");
        let dayOfYear = moment(item).dayOfYear();

        if (!dataForGraph[year].daysWithPost.includes(dayOfYear)) {
            dataForGraph[year].daysWithPost.push(dayOfYear);
        }
    });

    // dataForGraph = sort(dataForGraph);

    getDataForGraph(dataForGraph);

    return dataForGraph;
}

function getDataForGraph($data) {
    let json = JSON.stringify($data);
    let outputFolder = path.join("data");
    let filename = path.join(outputFolder, `postGraph.json`);

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    fs.writeFileSync(filename, json.replace(/^\s+/gm, ""));
}

export default { getDates };