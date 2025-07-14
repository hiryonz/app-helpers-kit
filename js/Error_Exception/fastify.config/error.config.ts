export function ErrorConfiguration(app: FastifyInstance) {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof HttpException) {
            reply.status(error.statusCode).send({
                error: error.name,
                message: error.message,
            });
        } else {
            console.error('Unhandled Error:', error);
            reply.status(500).send({
                error: 'InternalServerError',
                message: 'Something went wrong',
            });
        }
    });
}