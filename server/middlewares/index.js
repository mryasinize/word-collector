const globalErrorHandler = (error, req, res, next) => {
    try {
        console.log(error)
        return res.json({
            success: false,
            error: {
                message: "Server error",
                originalMessage: error.toString()
            }
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = { globalErrorHandler };