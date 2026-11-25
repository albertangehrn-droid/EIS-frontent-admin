/**
 * Feedback Selection and Formatting Utilities
 * Handles selection of highest priority feedback and message formatting
 */

/**
 * Select the highest priority feedback from feedback.all array
 * Priority: Failure feedbacks with smallest managerId
 * @param {Array} feedbacks - feedback.all array
 * @returns {Object|null} Selected feedback object or null
 */
export const selectHighestPriorityFeedback = (feedbacks) => {
  if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
    return null;
  }

  // Step 1: Filter feedbacks where outcomeType === "failure"
  const failureFeedbacks = feedbacks.filter(feedback =>
    feedback.outcomeType === "failure"
  );

  // Step 2: If no failure feedbacks, return null (will fallback to primary)
  if (failureFeedbacks.length === 0) {
    return null;
  }

  // Step 3: Sort by managerId ascending and select smallest managerId
  const sortedFailures = failureFeedbacks.sort((a, b) => {
    const managerIdA = parseInt(a.managerId) || 0;
    const managerIdB = parseInt(b.managerId) || 0;
    return managerIdA - managerIdB;
  });

  return sortedFailures[0]; // Return feedback with smallest managerId
};


/**
 * Helper – retrieve managerId for primary feedback.
 * If primary.managerId exists, use it.
 * Otherwise, fall back to the managerId of the highest‑priority feedback (first entry in feedback.all).
 */

export const getPrimaryManagerId = (feedback) => {
  if (feedback?.primary?.managerId) {
    return parseInt(feedback.primary.managerId, 10);
  }
  if (Array.isArray(feedback?.all) && feedback.all.length > 0) {
    const first = feedback.all[0];
    return parseInt(first.managerId, 10);
  }
  return null;
};



/**
 * Format feedback message by replacing placeholders
 * Order: **P first, ** second, *{id} last
 * @param {string} message - Raw feedback message
 * @param {Object} manager - Manager object with name, role, etc.
 * @param {Array} allManagers - All managers array for *{id} references
 * @returns {string} Formatted message
 */
export const formatFeedbackMessage = (message, manager, allManagers = []) => {
  if (!message || typeof message !== 'string') {
    return message;
  }

  let formattedMessage = message;

  // Step 1: Replace **P first (manager name + role)
  formattedMessage = formattedMessage.replace(/\*\*P/g, () => {
    if (manager) {
      const name = manager.name || 'Unknown Manager';
      const role = manager.role || '';
      return role ? `${name} (${role})` : name;
    }
    return 'Unknown Manager';
  });

  // Step 2: Replace ** (manager name only)
  formattedMessage = formattedMessage.replace(/\*\*/g, () => {
    if (manager) {
      return manager.name || 'Unknown Manager';
    }
    return 'Unknown Manager';
  });

  // Step 3: Replace *{id} references last using regex
  formattedMessage = formattedMessage.replace(/\*(\d+)/g, (match, id) => {
    const managerId = parseInt(id);
    const referencedManager = allManagers.find(m =>
      parseInt(m.managerId) === managerId
    );

    if (referencedManager) {
      return referencedManager.name || `Manager ${id}`;
    }

    return `Manager ${id}`;
  });

  return formattedMessage;
};

/**
 * Process feedback data and return formatted message
 * @param {Object} feedbackData - Complete feedback response from API
 * @param {Array} managers - All managers array
 * @returns {string} Formatted feedback message
 */
export const processFeedback = (feedbackData, managers = []) => {
  if (!feedbackData) {
    return '';
  }

  // Try to select highest priority feedback from feedback.all
  const selectedFeedback = selectHighestPriorityFeedback(feedbackData.all || []);

  if (selectedFeedback) {
    // Find the manager for this feedback
    const feedbackManager = managers.find(m =>
      parseInt(m.managerId) === parseInt(selectedFeedback.managerId)
    );

    // Format the selected feedback message
    return formatFeedbackMessage(
      selectedFeedback.message,
      feedbackManager,
      managers
    );
  }

  // Fallback to primary message if no failure feedback
  if (feedbackData.primary) {
    const primaryManagerId = getPrimaryManagerId(feedbackData);
    const feedbackManager = primaryManagerId
      ? managers.find(m => parseInt(m.managerId) === primaryManagerId)
      : null;

    return formatFeedbackMessage(
      feedbackData.primary.message || '',
      feedbackManager,
      managers
    );
  }


  return '';
};
