/**
 * Static text data for mission page speech synthesis
 * Plain text version of mission content for reliable speech extraction
 */

export const missionTextSections = [
  {
    id: 'context',
    label: 'The Context',
    text: `You and your Team have just been appointed by the Board of GlobeCom to a challenging and critical management mission: over the next 6 months you will be operating at FrontMedia, a recently acquired fast growing company.

Your objective is to persuade a successful but very independent-minded top management team to harmonize their processes to the ones of the GlobeCom Group by adopting "Boost AI", the corporate platform recently rolled out to systematically inject AI techniques in all key functions of the organization.

GlobeCom, your company, is a leading global telecom and media group, which over the last 10 years grew and expanded tremendously through entering new markets and through the acquisition of companies like FrontMedia, which joined the group almost 2 years ago.

FrontMedia is the most successful recent acquisition of GlobeCom. It is considered by everybody as the "cash cow" of the whole group, and is run proudly and independently by Emma Stuart, the CEO, and her management team.

"Boost AI" is the name of the platform GlobeCom has started rolling out more than 3 years ago to systematically inject AI techniques in the key functions of all the companies of the Group. "Boost AI" has rapidly become the backbone for performance improvement initiatives throughout the organization, providing everybody with the AI techniques they need to improve the performance of their key processes as well as to come up with a new generation of AI-enhanced products and services.

Over the last years "Boost AI" has been deployed successfully corporate-wide and adopted by all the companies controlled by GlobeCom except FrontMedia, where the CEO - Emma Stuart - has systematically delayed its implementation, in spite of the repeated requests of GlobeCom's Board.`
  },
  {
    id: 'project',
    label: 'The Project',
    text: `More specifically, the "Boost AI" platform developed and deployed by GlobeCom is a collection of AI techniques and the methodology needed to deploy them successfully to support decision making in all key functions of the organization - sometimes reaching out to external players or data sources too.

The different modules of "Boost AI" help managers in different functions to leverage their own know-how to co-design AI-enhanced processes and tools, supporting also the emergence of new AI-enhanced products and services. It also provides a way to enable managers and experts to network and collaborate on the development and fine-tuning of AI-enhanced processes and systems.

The fact that FrontMedia has not adopted the "Boost AI" platform yet is extremely disturbing for GlobeCom's Headquarters. Such systems need to be adopted consistently by everybody in order to really increase overall performance.

But for FrontMedia, adopting the group-wide AI platform represents a significant change and departure from the systems and processes they had deployed and used successfully before being acquired by GlobeCom. At the time of the acquisition, Emma Stuart indicated lots of enthusiasm for integrating all the processes of her company to the ones of the group, particularly the ones based on AI techniques, but since then FrontMedia did not change a lot its way of operating.

At the time of the acquisition, the Board of GlobeCom agreed to leave FrontMedia's top management team in place because it had managed the company very successfully in the past. Two years after, all the attempts of GlobeCom's Board to introduce the "Boost AI" platform at FrontMedia had failed.`
  },
  {
    id: 'challenge',
    label: 'Your Challenge',
    text: `Sending information about the advantages of the corporate platform harmonization and spreading news about its successful adoption in other group's companies did not help. Emma Stuart seemed simply too busy running her successful company to have time for introducing new systems and approaches.

The "excuses" she presented - lack of time and resources, other priorities, etc. - have thus slowed down and hindered the efficient roll-out of the "Boost AI" platform corporate-wide.

In summary, after many unsuccessful attempts, your challenge now is to persuade the CEO of FrontMedia and her top management team to finally adopt the "Boost AI" platform and harmonize their processes and systems to the ones of the whole group. GlobeCom's Board has given you up to 6 months (120 days) for this project.

During this time, you will be able to:

Gather information about FrontMedia top management
Implement different change management initiatives
Monitor your progress in helping the 24 members of the top management team to move through the phases of gaining Awareness, Interest, then becoming willing to Try/Experiment, and finally Adopt the innovation you are proposing

Your and your Change Agents Team's objective is to get as many adopters as possible. This is the way your performance will be evaluated by GlobeCom's Board at the end of the 6 months.

ATTENTION: The personal assistant to the CEO, Ms. Stefanie Durand, and the external financial controller, Dr. Bert Heinze, are not required to become users of the "Boost AI" platform at this stage. Hence the maximum number of adopters you can reach is 22.`
  },
  {
    id: 'approach',
    label: 'How to go about it',
    text: `The innovations you are introducing at FrontMedia can generate potentially significant value for both FrontMedia and GlobeCom. We know it. But changing the way people think and behave in organizations is not a simple task and often requires a combination of different tactics to be used at the right time with the right people. This simulation will make it possible for you to experiment with the implementation of different types of persuasion and change management initiatives.

The success of your intervention will be ultimately determined by your strategy, by your change diffusion and persuasion approach, and by your capability as a team to work cohesively also through difficult times.

Accordingly, before your first decision, we advise you to:

Try to understand well the organizational context in which you are going to operate, as well as your role. Remember that you have been sent there by the Board of GlobeCom. You will have to use persuasion, not authority.

Review the list of initiatives that you can launch to try to influence and change people attitudes.

Start by developing and agreeing as a team on a general strategy to guide you through your intervention project.

Good luck!`
  }
];

/**
 * Get mission section text by ID
 * @param {string} sectionId - ID of the section
 * @returns {Object|null} - Section object or null if not found
 */
export const getMissionTextSection = (sectionId) => {
  return missionTextSections.find(section => section.id === sectionId) || null;
};

/**
 * Get all mission text sections
 * @returns {Array} - Array of all mission sections
 */
export const getAllMissionTextSections = () => {
  return missionTextSections;
};

export default missionTextSections;
