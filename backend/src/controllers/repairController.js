const { repairService } = require('../services/dataService');

exports.createBooking = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      deviceModel,
      serviceType,
      issueDescription,
      preferredDate,
    } = req.body;

    if (!customerName || !phone || !deviceModel || !serviceType || !issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, phone number, device model, service type, and issue description.',
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `REP-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const booking = await repairService.createRepair({
      ticketNumber,
      customerName,
      phone,
      deviceModel,
      serviceType,
      issueDescription,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      status: 'Received',
    });

    return res.status(201).json({
      success: true,
      message: 'Repair booking submitted successfully! Our Phnom Penh technical center has received your request.',
      booking,
    });
  } catch (error) {
    console.error('Create repair error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create repair booking.' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await repairService.getAllRepairs();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get all repairs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve repair bookings.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technicianNotes, estimatedPrice, deviceModel, serviceType, issueDescription, customerName, phone } = req.body;

    const validStatuses = ['Received', 'Diagnostic', 'Waiting for Parts', 'In Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    await repairService.updateRepair(id, {
      status,
      technicianNotes,
      estimatedPrice,
      deviceModel,
      serviceType,
      issueDescription,
      customerName,
      phone,
    });

    const booking = await repairService.getByTicket(id) || { id, status };

    return res.status(200).json({
      success: true,
      message: 'Repair ticket updated successfully.',
      booking,
    });
  } catch (error) {
    console.error('Update repair error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update repair booking.' });
  }
};

exports.createWalkinBooking = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      deviceModel,
      serviceType,
      issueDescription,
      technicianNotes,
      estimatedPrice,
      status,
    } = req.body;

    if (!customerName || !phone || !deviceModel || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, device model, and service type are required.',
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `REP-WALK-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const booking = await repairService.createRepair({
      ticketNumber,
      customerName,
      phone,
      deviceModel,
      serviceType,
      issueDescription: issueDescription || 'Walk-in technical assessment',
      technicianNotes: technicianNotes || 'Intake completed at G-Zen BKK1 Technical Service Desk',
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : 0,
      preferredDate: new Date().toISOString().split('T')[0],
      status: status || 'Received',
    });

    return res.status(201).json({
      success: true,
      message: `Walk-in repair ticket #${ticketNumber} created successfully.`,
      booking,
    });
  } catch (error) {
    console.error('Create walkin repair error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create walk-in repair ticket.' });
  }
};

exports.getBookingByTicket = async (req, res) => {
  try {
    const { ticket } = req.params;
    const booking = await repairService.getByTicket(ticket);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Repair ticket not found.' });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve repair ticket.' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await repairService.deleteRepair(id);
    return res.status(200).json({ success: true, message: 'Repair ticket deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete repair booking.' });
  }
};
