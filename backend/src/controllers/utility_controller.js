import Subscription from '../models/NewsSubscription.js';

class UtilityController {
  async subscribeEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
      }
      // Check if already subscribed
      const exists = await Subscription.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: 'Email already subscribed.' });
      }
      const subscription = new Subscription({ email });
      await subscription.save();
      return res.status(201).json({ message: 'Subscribed successfully.' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error.' });
    }
  }
}

export default new UtilityController();