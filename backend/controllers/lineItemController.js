const prisma = require('../prismaClient');

exports.deleteLineItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lineItem = await prisma.lineItem.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Line item deleted successfully', lineItem });
  } catch (error) {
    // If the record doesn't exist, Prisma throws an error (P2025)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Line item not found' });
    }
    next(error);
  }
};
