import { HttpException } from "./http-exceptions";

export function handleError(res: any, error: any) {
    if (error instanceof HttpException) {
        return res.status(error.statusCode).send({ message: error.message });
    }
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error' });
}

export function returnErrorInstance(error: any) {
    if (error instanceof HttpException) {
        throw error;
    }
}
