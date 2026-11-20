module.exports = ({ page, limit }) => ({ limit, offset: (page - 1) * limit, page });
