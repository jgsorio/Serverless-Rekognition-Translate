const axios = require('axios');
class Handler {
    constructor({ rekoSvc, translateSvc }) {
        this.rekoSvc = rekoSvc;
        this.translateSvc = translateSvc;
    }

    async getImageBuffer(imageUrl) {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'base64');
    }

    async detectImageLabels(buffer) {
        const results = await this.rekoSvc.detectLabels({
            Image: {
                Bytes: buffer
            }
        }).promise();

        const workingItems = results.Labels.filter(({ Confidence }) => Confidence > 80);
        const names = workingItems.map(({ Name }) => Name).join(' and ');
        return { workingItems, names };
    }

    async translateNames(names) {
        const params = {
            SourceLanguageCode: 'en',
            TargetLanguageCode: 'pt',
            Text: names
        }

        const { TranslatedText } = await this.translateSvc.translateText(params).promise();
        return TranslatedText.split(' e ');
    }

    async finalText(workingItems, names) {
        const result = [];

        for (const indexName in names) {
            const nameInPortuguese = names[indexName];
            const confidence = workingItems[indexName].Confidence;
            result.push(`${confidence.toFixed(2)}% de ser um ${nameInPortuguese}`);
        }

        return result;
    }

    async main(event) {
        try {
            const { imageUrl } = event.queryStringParameters;
            console.log('Downloading image...');
            const buffer = await this.getImageBuffer(imageUrl);

            console.log('Detecting image...');
            const { workingItems, names } = await this.detectImageLabels(buffer);

            console.log('Translating...');
            const translated = await this.translateNames(names);

            console.log('Finalizing...');
            const finalResult = await this.finalText(workingItems, translated)

            if (!imageUrl) {
                return {
                    statusCode: 400,
                    body: new Error("Missing param: imageUrl")
                }
            }
    
            return {
                statusCode: 200,
                body: finalResult
            }
        } catch (error) {
            console.log('Errror****', error.stack)
            return {
                statusCode: 500,
                body: 'Internal Server Error'
            }
        }
    }
}

module.exports = Handler