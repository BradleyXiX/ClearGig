const prisma = require('../prismaClient');

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        lineItems: true,
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { client_id, title, contingency_percentage, profit_margin } = req.body;

    if (!client_id || !title) {
      return res.status(400).json({ error: 'client_id and title are required' });
    }

    // Ensure client exists or create dummy behavior if client doesn't exist?
    // According to specs, client_id must be provided. Let's assume the client exists.
    const project = await prisma.project.create({
      data: {
        clientId: client_id,
        title,
        contingencyPercentage: contingency_percentage,
        profitMargin: profit_margin,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

exports.addLineItemToProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, description, estimated_hours, hourly_rate, is_recurring } = req.body;

    if (!category || !description || estimated_hours == null || hourly_rate == null) {
      return res.status(400).json({ error: 'Missing required line item fields' });
    }

    const lineItem = await prisma.lineItem.create({
      data: {
        projectId: id,
        category,
        description,
        estimatedHours: estimated_hours,
        hourlyRate: hourly_rate,
        isRecurring: is_recurring || false,
      },
    });

    res.status(201).json(lineItem);
  } catch (error) {
    next(error);
  }
};
