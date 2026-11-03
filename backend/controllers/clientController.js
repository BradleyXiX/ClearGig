const prisma = require('../prismaClient');

// Get all clients
exports.getClients = async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// Create a new client
exports.createClient = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null
      }
    });

    res.status(201).json(client);
  } catch (error) {
    // Never respond with the raw Prisma message: for a dead database it is a
    // generated-client snippet containing an absolute Windows path. The shared
    // error middleware maps it to a short, client-safe shape.
    next(error);
  }
};
