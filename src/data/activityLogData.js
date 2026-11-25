export const activityRows = [
  { id: 'event0', dec: 'EVENT', time: '( 0 )', event: '', result: '0p', sectionKey: 'event0' },
  { id: 'd1', dec: '# 1', time: '( 1- 1)', event: 'Face-To-Face Meeting (Durand)', result: '1p', sectionKey: 'd1' },
  { id: 'd2', dec: '# 2', time: '( 2- 2)', event: 'Face-To-Face Meeting (Stuart)', result: '1p', sectionKey: 'd2' },
  { id: 'd3', dec: '# 3', time: '( 3- 3)', event: 'Face-To-Face Meeting (Raponi)', result: '2p', sectionKey: 'd3' },
  { id: 'd4', dec: '# 4', time: '( 4- 6)', event: 'Internal Magazine', result: '3p', sectionKey: 'd4' },
  { id: 'd5', dec: '# 5', time: '( 7- 7)', event: 'Email', result: '1p', sectionKey: 'd5' },
  { id: 'd6', dec: '# 6', time: '( 8- 8)', event: 'Plenary Meeting', result: '0p', sectionKey: 'd6' },
  { id: 'd7', dec: '# 7', time: '( 9- 9)', event: 'Face-To-Face Meeting (deGroote)', result: '3p', sectionKey: 'd7' },
  { id: 'd8', dec: '# 8', time: '(10-14)', event: 'Plenary Meeting', result: '1p', sectionKey: 'd8' },
  { id: 'd9', dec: '# 9', time: '(15-17)', event: 'Dinner Event (Raponi)', result: '2p', sectionKey: 'd9' },
  { id: 'd10', dec: '#10', time: '(18-19)', event: 'Get Profiles', result: 'info', sectionKey: 'd10' },
  { id: 'd11', dec: '#11', time: '(20-22)', event: 'External Links', result: 'info', sectionKey: 'd11' },
  { id: 'd12', dec: '#12', time: '(23-23)', event: 'Workshop (Pastorakis)', result: '0p', sectionKey: 'd12' },
  { id: 'd13', dec: '#13', time: '(24-26)', event: 'Reception', result: '2p', sectionKey: 'd13' },
  { id: 'd14', dec: '#14', time: '(27-31)', event: 'Management Training', result: '10p', sectionKey: 'd14' },
  { id: 'd15', dec: '#15', time: '(32-35)', event: 'Pilot Test (Raponi)', result: '2p', sectionKey: 'd15' },
  { id: 'd16', dec: '#16', time: '(36-40)', event: 'Plenary Meeting', result: '10p', sectionKey: 'd16' },
  { id: 'd17', dec: '#17', time: '(41-43)', event: 'Dinner Event (Longhorn)', result: '0p', sectionKey: 'd17' },
  { id: 'd18', dec: '#18', time: '(44-44)', event: 'Face-To-Face Meeting (Longhorn)', result: '1p', sectionKey: 'd18' },
  { id: 'd19', dec: '#19', time: '(45-49)', event: 'Workshop (Longhorn)', result: '7p', sectionKey: 'd19' },
  { id: 'event49', dec: 'EVENT', time: '( 49 )', event: '', result: '2p', sectionKey: 'event49' },
  { id: 'd20', dec: '#20', time: '(50-54)', event: 'Directive', result: '-18p', sectionKey: 'd20' },
  { id: 'event54', dec: 'EVENT', time: '( 54 )', event: '', result: '4p', sectionKey: 'event54' },
  { id: 'd21', dec: '#21', time: '(55-55)', event: 'Face-To-Face Meeting (Longhorn)', result: '0p', sectionKey: 'd21' },
  { id: 'd22', dec: '#22', time: '(56-56)', event: 'Face-To-Face Meeting (Stuart)', result: '13p', sectionKey: 'd22' },
  { id: 'd23', dec: '#23', time: '(57-57)', event: 'Memo', result: '0p', sectionKey: 'd23' },
  { id: 'd24', dec: '#24', time: '(58-58)', event: 'Selective Email', result: '1p', sectionKey: 'd24' },
  { id: 'd25', dec: '#25', time: '(59-61)', event: 'Internal Magazine', result: '6p', sectionKey: 'd25' },
  { id: 'd26', dec: '#26', time: '(62-62)', event: 'Memo', result: '5p', sectionKey: 'd26' },
  { id: 'd27', dec: '#27', time: '(63-63)', event: 'Dinner Event (Stuart)', result: '0p', sectionKey: 'd27' },
];

export const reportSections = [
  {
    id: 'event0',
    title: 'EVENT',
    dayLabel: '(day 0)',
    rows: [
      {
        label: 'OUTCOME',
        value:
          "The Secretary of the Board of GlobeCom just sent an email with some more information about Emma Stuart, the CEO, her personal Assistant, Stefanie Durand, as well as Frank Raponi, FrontMedia's Chief HR Officer, which should be useful to you.\n\nThis additional information has been directly inserted in Emma Stuart's, Stefanie Durand and Frank Raponi's Personal Profiles which you can access directly by CLICKING on the 'bubble' icon next to their names.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd1',
    title: 'DECISION 1',
    dayLabel: '(day 1)',
    rows: [
      { label: 'TACTIC', value: 'Face-To-Face Meeting (Durand)' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          "Lots of mail has arrived on the Personal Assistant's desk on this subject, but it has always been a bit confusing. Your active involvement and explanation of this issue is rather timely.\n\nAt the beginning it was much appreciated that you personally showed up but at the end your explanations of the importance of AI in organizations were perceived as quite lengthy.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd2',
    title: 'DECISION 2',
    dayLabel: '(day 2)',
    rows: [
      { label: 'TACTIC', value: 'Face-To-Face Meeting (Stuart)' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          "This has been a very interesting first meeting!\nIt is now clear to you that the CEO has not had very good experiences with 'consultants' from outside the company or 'colleagues' sent from GlobeCom Headquarters. It is thus going to be difficult to convince her.\n\nEmma Stuart does not appear to be a big fan of technological innovations; she is old school.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd3',
    title: 'DECISION 3',
    dayLabel: '(day 3)',
    rows: [
      { label: 'TACTIC', value: 'Face-To-Face Meeting (Raponi)' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          'Frank Raponi begins the meeting by telling you what the advantages of AI-enhanced processes in organizations are! You are pleasantly surprised to see this level of support and interest.',
      },
    ],
    adopters: 0,
  },
  {
    id: 'd4',
    title: 'DECISION 4',
    dayLabel: '(days 4-6)',
    rows: [
      { label: 'TACTIC', value: 'Internal Magazine' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          'Those who took the time to read your magazine article become more interested in the many AI-related opportunities which could emerge, and start to mention it to their colleagues.',
      },
    ],
    adopters: 0,
  },
  {
    id: 'd5',
    title: 'DECISION 5',
    dayLabel: '(day 7)',
    rows: [
      { label: 'TACTIC', value: 'Email' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          "Informing people via email doesn't seem to correspond to the 'high-touch' culture of FrontMedia (except perhaps for the IT people). There was no reply, and actually you are not even sure that they have read your email or left it in the large stack of unread and not responded emails you heard that managers have in their over-crowded mailboxes.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd6',
    title: 'DECISION 6',
    dayLabel: '(day 8)',
    rows: [
      { label: 'TACTIC', value: 'Plenary Meeting' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          "Sorry, but you simply don't succeed in getting an appropriate room for the meeting. By the way, Adam deGroote's department also oversees the deployment of all the office and meeting rooms in FrontMedia facilities. It might be a good idea to have a word with him.\n\nIn the meantime, you just wasted another day in unsuccessful attempts to organize the meeting.\n\nFrom a point of view of getting more support, this doesn't seem to be the most successful approach.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd7',
    title: 'DECISION 7',
    dayLabel: '(day 9)',
    rows: [
      { label: 'TACTIC', value: 'Face-To-Face Meeting (deGroote)' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          "It's a lot clearer now what good this system will do for the company. You have been quite well organized in your thinking. Adam deGroote will be helpful in the future.",
      },
    ],
    adopters: 0,
  },
  {
    id: 'd8',
    title: 'DECISION 8',
    dayLabel: '(days 10-14)',
    rows: [
      { label: 'TACTIC', value: 'Plenary Meeting' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          'Unfortunately, your presentation followed a lengthy, tiring discussion about whether a new line of services should be developed. You realize that interest in your agenda item is rather limited.',
      },
    ],
    adopters: 0,
  },
  {
    id: 'd9',
    title: 'DECISION 9',
    dayLabel: '(days 15-17)',
    rows: [
      { label: 'TACTIC', value: 'Dinner Event (Raponi)' },
      { label: 'RATIONALE', value: '' },
      {
        label: 'OUTCOME',
        value:
          'Frank Raponi accepted your invitation and enjoyed the dinner. This definitely helped in making Frank Raponi respond more positively to your initiatives.\n\nThis was definitely an effective way of making Frank Raponi more interested in a number of features of the "Boost AI" platform which you extensively discussed over dinner! Nevertheless, for reaching higher levels of involvement, other approaches might be necessary…',
      },
    ],
    adopters: 0,
  },
  {
    id: 'd10',
    title: 'DECISION 10',
    dayLabel: '(days 18-19)',
    rows: [
      { label: 'TACTIC', value: 'Get Profiles (Atherson) (Pastorakis) (Stein) (Peters) (Kupik)' },
      { label: 'RATIONALE', value: 'We need more info on the managers!' },
      { label: 'OUTCOME', value: 'Requested information delivered to you.' },
    ],
    adopters: 0,
  },
];
