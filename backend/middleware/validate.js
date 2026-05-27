


export const validate = (schema) => (req, res, next) => {
    try{
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        next();
    }catch(error){
        const issues = error.issues || error.errors || [];

        return res.status(400).json({
            error: "Validation Failed",
            details: issues.map(e => ({
                field: e.path.slice(1).join('.') || e.path.join('.'),
                message: e.message,
            }))
        });
    }
};
