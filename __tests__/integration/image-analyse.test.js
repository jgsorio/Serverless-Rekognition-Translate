const aws = require('aws-sdk');
aws.config.update({
    region: 'us-east-1'
});

const { describe, test, expect } = require('@jest/globals');

const requestMock = require('../mocks/request.json');
const index = require('../../src');

describe('Image analyser test suit', () => {
    test('Should analyse an image sucessfuly', async () => {
        const finalText = [
            "99.68% de ser um Grama",
            "99.68% de ser um planta",
            "94.42% de ser um cão",
            "94.42% de ser um canino",
            "94.42% de ser um animal de estimação",
            "94.42% de ser um mamífero",
            "94.42% de ser um animal",
            "83.62% de ser um Strap",
            "80.43% de ser um Terrier",
        ];
        const expected = {
            statusCode: 200,
            body: finalText
        }

        const result = await index.main(requestMock);
        expect(result).toStrictEqual(expected);
    });
});