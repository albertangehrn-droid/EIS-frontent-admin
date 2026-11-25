/**
 * Demo Speech Data
 * Contains all text content for automatic speech synthesis
 */

export const MISSION_SPEECH_TEXT = `In this GAME SESSION you will be taking over as a Change Agent at FrontMedia, where you will first of all review the MISSION (please do it before starting).

To succeed in your role, you will need to:

... develop a STRATEGY to address the challenging project at FrontMedia

... manage your available TIME wisely

... collect information and insights about the managers of FrontMedia

... succeed in changing the attitude of the managers towards the proposed change.

By launching appropriate INITIATIVES, you can make a real difference at FrontMedia.

Your SCORE and ACTIVITY LOG will help you track your progress and understand the impact of your decisions.`;

export const GAME_INTRO_SPEECH_TEXT = `Welcome to the EIS Simulation! 

You are about to begin an exciting journey as a Change Agent at FrontMedia, a leading media company facing the challenge of implementing artificial intelligence in their operations.

Your mission is to persuade the management team to embrace AI technology and drive organizational transformation.

Take your time to explore the different sections, understand the managers' perspectives, and make strategic decisions that will impact the company's future.

Good luck, and remember - every decision counts!`;

export const STRATEGY_SPEECH_TEXT = `Strategy is your key to success in this simulation.

A well-developed strategy will help you:

- Identify the right managers to target first
- Choose the most effective initiatives to launch
- Time your decisions for maximum impact
- Build momentum for organizational change

Remember that different managers respond differently to various approaches. Some may need more convincing, while others might be early adopters.

Take time to analyze the situation and plan your moves carefully.`;

export const SCORE_SPEECH_TEXT = `Your score reflects your effectiveness as a Change Agent.

The score is calculated based on:

- Number of days taken to achieve adoption
- Efficiency of your initiatives
- Manager engagement levels
- Overall organizational impact

A lower score means you achieved your goals more quickly and efficiently.

Use this feedback to understand your performance and improve your strategy in future simulations.`;

export const ACTIVITY_LOG_SPEECH_TEXT = `The Activity Log keeps track of all your decisions and their outcomes.

Here you can review:

- The initiatives you launched
- Which managers were targeted
- The results of each decision
- Timeline of events

This log helps you understand the cause and effect of your actions, allowing you to learn from both successes and failures.

Use it to identify patterns and refine your approach as you progress through the simulation.`;

export const ORG_CHART_SPEECH_TEXT = `The Organization Chart shows you the structure and relationships at FrontMedia.

Key insights from the org chart:

- Reporting lines and team structures
- Manager roles and responsibilities
- Communication channels in the organization
- Key decision makers and influencers

Understanding the organizational structure will help you navigate the political landscape and identify the most effective pathways for change.

Pay attention to who reports to whom and how information flows through the company.`;

export const ORG_NETWORK_SPEECH_TEXT = `The Organizational Network reveals the informal connections and influence patterns.

This visualization shows:

- Who the real influencers are
- Information flow networks
- Social connections beyond formal structure
- Key relationship hubs

These informal networks often determine how change actually spreads through an organization.

Targeting well-connected managers can create ripple effects that accelerate adoption across the entire company.`;

// Manager specific speech texts
export const MANAGER_INTRODUCTIONS = {
  'Emma Stuart': `Emma Stuart is the CEO of FrontMedia. As a highly respected leader related to the old shareholder family by marriage, she was designated to become the next CEO for many years and assumed the position 4 years ago. She is viewed as extremely competent but traditional, with a loyal internal team and a strong focus on results and budgets.`,
  
  'Bert Heinze': `Bert Heinze is one of the senior managers at FrontMedia. No detailed information is currently available about his background or role in the organization.`,
  
  'Stefanie Durand': `Stefanie Durand is the Personal Assistant to the CEO. Recently graduated in Business Administration from a nearby university, she has been in this premier assignment for two years and is definitely one of the company's high potentials. Very protective of the CEO and loves scheduling appointments, screening information, and setting meeting agendas. Has wide exposure to the major issues in the business.`,
  
  'Frank Raponi': `Frank Raponi is the Chief HR Officer. He loves proposing new and wild ideas. Spent more than a decade in the strategy department of a multinational HR consultancy. Strongly believes HR must create strategic value for the company and is always first to highlight new HR trends. Often frustrates old-timers because the promise tends to exceed actual delivery. Wishes he were more organized.`,
  
  'Martin Buerli': `Martin Buerli is perceived as the top manager behind the company's recent cost controls. Joined several years ago with strong business school credentials, though employees jokingly referred to MBA as "Master of Brutal Action." Over time his reputation improved significantly. Strong believer in transformation through cost savings and a true lover of Swiss cheese fondue.`
};

// Initiative speech texts
export const INITIATIVE_DESCRIPTIONS = {
  'face_to_face_meeting': `Face-to-face meetings provide the most direct and personal way to communicate with managers. This approach allows for immediate feedback, reading body language, and building personal relationships. However, it requires more time and resources than other methods.`,
  
  'email_communication': `Email communication is efficient for reaching multiple managers simultaneously. It provides documentation of your messages and allows managers to respond at their convenience. However, it lacks the personal touch and may be less persuasive than direct communication.`,
  
  'workshop_presentation': `Workshop presentations combine education with persuasion. They allow you to showcase the benefits of AI through interactive sessions. This approach works well for groups of managers who learn better through visual and hands-on experiences.`,
  
  'one_on_one_coaching': `One-on-one coaching provides personalized attention to individual managers. This method is effective for addressing specific concerns and building trust. It's particularly useful for influential managers who may need extra convincing.`
};

// Help and guidance speech texts
export const HELP_SPEECH_TEXT = `Need help navigating the simulation? Here are some tips:

Start by reviewing the Mission to understand your objectives.

Explore the Organization Chart to learn about the managers.

Check the Activity Log to see your progress.

Use the Score section to track your performance.

Remember that timing is crucial - some managers need more time than others to adopt new ideas.

Good luck, Change Agent!`;

export const GAME_SESSION_INTRO_SPEECH_TEXT = `In this GAME SESSION you will be taking over as a Change Agent at FrontMedia, where you will first of all review the MISSION (please do it before starting).

To succeed in your role, you will need to develop a STRATEGY to address the challenging project at FrontMedia, manage your available TIME wisely, collect information and insights about the managers of FrontMedia, and succeed in changing the attitude of the managers towards the proposed change.

By launching appropriate INITIATIVES, you can make a real difference at FrontMedia.

Your SCORE and ACTIVITY LOG will help you track your progress and understand the impact of your decisions.`;

export default {
  MISSION_SPEECH_TEXT,
  GAME_INTRO_SPEECH_TEXT,
  GAME_SESSION_INTRO_SPEECH_TEXT,
  STRATEGY_SPEECH_TEXT,
  SCORE_SPEECH_TEXT,
  ACTIVITY_LOG_SPEECH_TEXT,
  ORG_CHART_SPEECH_TEXT,
  ORG_NETWORK_SPEECH_TEXT,
  MANAGER_INTRODUCTIONS,
  INITIATIVE_DESCRIPTIONS,
  HELP_SPEECH_TEXT
};
