const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
        schema.parse(data);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: error.errors
        });
    }
};

module.exports = validate;
