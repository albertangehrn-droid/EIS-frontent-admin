"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
import { useDevice } from '@/hooks/useDevice';
import { teams, getPersonImage, getPersonColor, getPersonStatus, getPersonHoverImage } from '@/data/orgChartData';
import { IMAGES } from '@/utils/imagePaths';
import { useSoundContext } from '@/contexts/SoundContext';

// ── Layout Constants ─────────────────────────────────────────────────────────
const AV_MD = 46;
const AV_XL = 82;

const CEO_LEFT = 490;
const CEO_CX = CEO_LEFT + AV_XL / 2;

const STEF_CX = 290;
const STEF_LEFT = STEF_CX - AV_MD / 2;

const BERT_CX = 790;
const BERT_LEFT = BERT_CX - AV_MD / 2;

const LEADER_CX = [120, 380, 640, 900];

function leaderContainerLeft(i) {
  return LEADER_CX[i] - AV_MD / 2;
}

const CEO_BOTTOM_Y = 108;
const L1_HLINE_Y = 158;
const L2_HLINE_Y = 235;
const LEADER_TOP_Y = 252;
const LEADER_BOTTOM_Y = 300;
const TEAM_BOX_TOP_Y = 312;

// ── Status Config ────────────────────────────────────────────────────────────
const STATUS_DOT = {
  completed: 'bg-purple-600',
  adopter: 'bg-green-500',
  experiment: 'bg-blue-500',
  interest: 'bg-yellow-400',
  aware: 'bg-orange-400',
  unaware: 'bg-gray-300',
};

const STATUS_TEXT_COLOR = {
  completed: '#7c3aed',
  adopter: '#16a34a',
  experiment: '#2563eb',
  interest: '#ca8a04',
  aware: '#ea580c',
  unaware: '#9ca3af',
};

// ── Shared Components ────────────────────────────────────────────────────────
function AvatarCircle({ initials, size = 'md', status = null, image = null, showStatusDot = true }) {
  const sizeClass =
    size === 'xl' ? 'h-[82px] w-[82px] text-sm' :
      size === 'lg' ? 'h-14 w-14 text-xs' :
        size === 'sm' ? 'h-9 w-9 text-[10px]' :
          'h-[46px] w-[46px] text-xs';

  return (
    <div className="relative flex-shrink-0">
      {image ? (
        <div className={`relative ${sizeClass} rounded-full border border-gray-300 overflow-hidden shadow-sm`}>
          <Image src={image} alt={initials} fill className="object-cover" />
        </div>
      ) : (
        <div className={`flex ${sizeClass} items-center justify-center rounded-full border border-gray-300 bg-gradient-to-b from-white to-gray-100 font-semibold text-gray-700 shadow-sm`}>
          {initials}
        </div>
      )}
      {status && showStatusDot && (
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${STATUS_DOT[status] || 'bg-gray-300'} border-2 border-white`} />
      )}
    </div>
  );
}

function PersonLabel({ name, title, textAlign = 'left', color = '#222' }) {
  return (
    <div style={{ textAlign }}>
      <div className="text-[12px] font-semibold leading-tight" style={{ color, wordBreak: 'break-word' }}>{name}</div>
      <div className="text-[10px] text-[#888] whitespace-nowrap">{title}</div>
    </div>
  );
}

function ChartPerson({
  person,
  style,
  align = 'row',
  avatarSize = 'md',
  status = null,
  onHover,
  onLeave,
  image = null,
  reverse = false,
  color = '#222',
  showStatusDot = true,
  isVisible = true,
}) {
  const ghostClass = `flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400`;
  const ghostSize = avatarSize === 'xl' ? 'h-[82px] w-[82px]' : avatarSize === 'lg' ? 'h-14 w-14' : 'h-[46px] w-[46px]';
  const GhostIcon = ({ iconSize = 'w-5 h-5' }) => (
    <div className={`${ghostClass} ${ghostSize}`}>
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );

  return (
    <div
      className="absolute cursor-pointer"
      style={style}
      onMouseEnter={() => onHover && onHover(person)}
      onMouseLeave={() => onLeave && onLeave()}
    >
      {align === 'column' ? (
        <div className="flex flex-col items-center gap-1">
          {isVisible
            ? <AvatarCircle initials={person.initials} size={avatarSize} status={status} image={image} showStatusDot={showStatusDot} />
            : <GhostIcon iconSize="w-5 h-5" />
          }
          <div className="text-center mt-1">
            <div className="text-[13px] font-semibold" style={{ color }}>{person.name}</div>
            <div className="text-[11px] text-[#888]">{person.title}</div>
          </div>
        </div>
      ) : reverse ? (
        <div className="flex flex-row items-center gap-2">
          <PersonLabel name={person.name} title={person.title} textAlign="right" color={color} />
          {isVisible
            ? <AvatarCircle initials={person.initials} size={avatarSize} status={status} image={image} showStatusDot={showStatusDot} />
            : <GhostIcon iconSize="w-4 h-4" />
          }
        </div>
      ) : (
        <div className="flex flex-row items-center gap-2">
          {isVisible
            ? <AvatarCircle initials={person.initials} size={avatarSize} status={status} image={image} showStatusDot={showStatusDot} />
            : <GhostIcon iconSize="w-4 h-4" />
          }
          <PersonLabel name={person.name} title={person.title} textAlign="left" color={color} />
        </div>
      )}
    </div>
  );
}

function HLine({ y, x1, x2 }) {
  return <div className="absolute bg-gray-400" style={{ top: y, left: x1, width: x2 - x1, height: 1 }} />;
}
function VLine({ x, y1, y2 }) {
  return <div className="absolute bg-gray-400" style={{ top: y1, left: x, width: 1, height: y2 - y1 }} />;
}

// ── Mobile Components ────────────────────────────────────────────────────────
function MobileAvatarCircle({ initials, size = 'md', status = null, image = null, showStatusDot = true }) {
  const sizeClass =
    size === 'xl' ? 'h-14 w-14 sm:h-20 sm:w-20 text-xs sm:text-sm' :
      size === 'lg' ? 'h-12 w-12 sm:h-14 sm:w-14 text-xs' :
        size === 'sm' ? 'h-8 w-8 sm:h-9 sm:w-9 text-[9px] sm:text-[10px]' :
          'h-10 w-10 sm:h-[46px] sm:w-[46px] text-xs';

  return (
    <div className="relative flex-shrink-0">
      {image ? (
        <div className={`relative ${sizeClass} rounded-full border border-gray-300 overflow-hidden shadow-sm`}>
          <Image src={image} alt={initials} fill className="object-cover" />
        </div>
      ) : (
        <div className={`flex ${sizeClass} items-center justify-center rounded-full border border-gray-300 bg-gradient-to-b from-white to-gray-100 font-semibold text-gray-700 shadow-sm`}>
          {initials}
        </div>
      )}
      {status && showStatusDot && (
        <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${STATUS_DOT[status] || 'bg-gray-300'} border-2 border-white`} />
      )}
    </div>
  );
}

function MobilePersonCard({ person, status, image, color, onClick, showStatusDot = true }) {
  const { playClickSound } = useSoundContext();
  const parts = person.name.split(' ');
  const first = parts[0];
  const last = parts.slice(1).join(' ');

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => { playClickSound(); if (onClick) onClick(person); }}
    >
      <MobileAvatarCircle initials={person.initials} status={status} image={image} showStatusDot={showStatusDot} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-[13px] sm:text-[15px] font-semibold truncate" style={{ color }}>{first}</span>
          <span className="text-[11px] sm:text-[13px] font-bold truncate" style={{ color }}>{last}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-gray-500 truncate">{person.title}</div>
      </div>
    </div>
  );
}

function MobileOrgChartView({ gameState, showStatusDots = false }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const { playClickSound } = useSoundContext();

  const statusOf = (name) => getPersonStatus(name, gameState);
  const imageOf = (name) => getPersonImage(name);
  const colorOf = (name) => getPersonColor(name);
  const hoverImageOf = (name) => getPersonHoverImage(name);

  const getManagerByName = (name) => {
    if (!gameState?.managers || !name) return null;
    return gameState.managers.find((m) =>
      m.name.includes(name.split(' ')[0]) || name.includes(m.name.split(' ')[0])
    );
  };

  const getPersonDescription = (person) => {
    if (!person) return null;
    const manager = getManagerByName(person.name);
    return manager?.description || person.description || 'No additional information available.';
  };

  const getPersonRole = (person) => {
    const manager = person ? getManagerByName(person.name) : null;
    return manager?.role || person?.title || '';
  };

  const ceo = { name: 'Emma Stuart', title: 'CEO', initials: 'ES' };
  const assistant1 = { name: 'Stefanie Durand', title: 'Pers. Assistant', initials: 'SD' };
  const assistant2 = { name: 'Bert Heinze PhD', title: 'Ext. Fin. Controller', initials: 'BH' };

  return (
    <div className="flex flex-col h-full bg-[#f4f4f2] overflow-hidden">
      {/* Sub Header */}
      <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-300">
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 font-serif tracking-wide">ORGANIZATION CHART</h1>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-3">
          <span className="text-[10px] sm:text-xs text-gray-500">Status:</span>
          {[
            { label: 'Aware', color: 'bg-orange-400' },
            { label: 'Int.', color: 'bg-yellow-400' },
            { label: 'Exp.', color: 'bg-blue-500' },
            { label: 'Adopt', color: 'bg-green-500' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-0.5 sm:gap-1">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${color}`} />
              <span className="text-[9px] sm:text-[10px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 pb-20">
        {/* CEO */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Chief Executive Office</h2>
          <div className="flex flex-col gap-2 sm:gap-3">
            <MobilePersonCard person={ceo} status={statusOf(ceo.name)} image={imageOf(ceo.name)} color={colorOf(ceo.name)} onClick={setSelectedPerson} showStatusDot={showStatusDots} />
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pl-4 sm:pl-6">
              <MobilePersonCard person={assistant1} status={statusOf(assistant1.name)} image={imageOf(assistant1.name)} color={colorOf(assistant1.name)} onClick={setSelectedPerson} showStatusDot={showStatusDots} />
              <MobilePersonCard person={assistant2} status={statusOf(assistant2.name)} image={imageOf(assistant2.name)} color={colorOf(assistant2.name)} onClick={setSelectedPerson} showStatusDot={showStatusDots} />
            </div>
          </div>
        </div>

        {/* Department Leaders */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Department Leaders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {teams.map((team) => (
              <MobilePersonCard key={team.leader.name} person={team.leader} status={statusOf(team.leader.name)} image={imageOf(team.leader.name)} color={colorOf(team.leader.name)} onClick={setSelectedPerson} showStatusDot={showStatusDots} />
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Team Members</h2>
          <div className="space-y-4 sm:space-y-6">
            {teams.map((team) => (
              <div key={team.leader.name} className="bg-white rounded-lg border border-gray-300 p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">{team.leader.title} Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team.members.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2 p-1.5 sm:p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => { playClickSound(); setSelectedPerson(member); }}
                    >
                      <MobileAvatarCircle initials={member.initials} size="sm" status={statusOf(member.name)} image={imageOf(member.name)} showStatusDot={showStatusDots} />
                      <div className="min-w-0">
                        <div className="text-[12px] sm:text-[13px] font-medium truncate" style={{ color: colorOf(member.name) }}>{member.name}</div>
                        <div className="text-[9px] sm:text-[10px] text-gray-500 truncate">{member.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => { playClickSound(); setSelectedPerson(null); }}
        >
          <div
            className="bg-[#f4f4f2] w-full max-w-sm border border-gray-600 shadow-xl overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-black border-b border-gray-700">
              <h3 className="text-yellow-400 font-bold text-sm tracking-wide">PERSON DETAILS</h3>
              <button onClick={() => { playClickSound(); setSelectedPerson(null); }} className="text-yellow-400 hover:text-yellow-300 text-lg leading-none font-bold px-2">×</button>
            </div>
            <div className="p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 border border-gray-400 overflow-hidden flex-shrink-0 bg-white rounded-md shadow-sm">
                  <Image src={hoverImageOf(selectedPerson.name) || imageOf(selectedPerson.name)} alt={selectedPerson.name} fill className="object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base sm:text-lg text-gray-900 leading-tight border-b border-gray-300 pb-1">{selectedPerson.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1.5 font-medium">{getPersonRole(selectedPerson)}</div>
                  {statusOf(selectedPerson.name) && statusOf(selectedPerson.name) !== 'unaware' && (
                    <div className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: STATUS_TEXT_COLOR[statusOf(selectedPerson.name)] }}>
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[statusOf(selectedPerson.name)]}`} />
                      {statusOf(selectedPerson.name)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-300">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{getPersonDescription(selectedPerson)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function OrgChartPage() {
  const router = useRouter();
  const { gameState } = usePlayDemoGame();
  console.log("check datat is coming or not ---------------------------knanidn", gameState)
  const device = useDevice();
  const { playClickSound } = useSoundContext();

  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [headerProfileHovered, setHeaderProfileHovered] = useState(false);
  const [showStatusDots, setShowStatusDots] = useState(false);

  // ── FEATURE 1: Sidebar filter state ─────────────────────────────────────
  // activeStatus = clicked filter (toggle), hoveredStatus = hover preview
  const [activeStatus, setActiveStatus] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Which filter is currently in effect (hover takes priority over click)
  const currentFilter = hoveredStatus || activeStatus;

  const statusOf = (name) => getPersonStatus(name, gameState);

  // ── Mobile/Tablet ────────────────────────────────────────────────────────
  if (device === 'mobile' || device === 'tablet') {
    return (
      <div className="h-screen bg-[#f4f4f2] flex flex-col overflow-hidden">
        <SimulationHeader
          leftContent={(
            <GameButton onClick={() => { playClickSound(); router.push('/playDemo'); }} variant="default" size="lg" className="py-2! px-2! sm:px-6! text-sm! sm:text-xl! min-w-[80px] sm:min-w-[260px]">
              <span className="sm:hidden">EIS</span>
              <span className="hidden sm:inline">EIS Simulation</span>
            </GameButton>
          )}
          rightContent={(
            <div className="flex gap-2 sm:gap-4 items-center">
              <div className="flex flex-col items-center cursor-pointer select-none group" onClick={() => { playClickSound(); setShowStatusDots(!showStatusDots); }} title="Toggle status dots">
                <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-gray-300 overflow-hidden shadow-md group-hover:border-blue-400">
                  <Image src={IMAGES.ALL.UZZI.NET2} alt="Relation Checker" fill className="object-cover" />
                  <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                </div>
                <span className="text-[9px] mt-0.5 text-gray-500">{showStatusDots ? 'Hide' : 'Show'}</span>
              </div>
              <GameButton label="ORG NETWORK" onClick={() => { playClickSound(); router.push('/orgnetwork'); }} variant="nav" size="md" className="py-2! px-2! sm:px-4! text-xs! sm:text-sm! min-w-[100px] sm:min-w-[160px]" />
              <GameButton onClick={() => { playClickSound(); router.push('/playDemo'); }} variant="nav" size="md" className="py-2! px-2! sm:px-4! text-xs! sm:text-sm! min-w-[50px] sm:min-w-[160px]">
                <span className="sm:hidden">BACK</span>
                <span className="hidden sm:inline">BACK TO PLAY</span>
              </GameButton>
            </div>
          )}
        />
        <div className="flex-1 overflow-hidden">
          <MobileOrgChartView gameState={gameState} showStatusDots={showStatusDots} />
        </div>
        <SimulationFooter usedDays={gameState?.time || 0} />
      </div>
    );
  }

  // ── Desktop helpers (defined after mobile early-return) ──────────────────
  const imageOf = (name) => getPersonImage(name);
  const colorOf = (name) => getPersonColor(name);

  const getManagerByName = (name) => {
    if (!gameState?.managers || !name) return null;
    return gameState.managers.find((m) =>
      m.name.includes(name.split(' ')[0]) || name.includes(m.name.split(' ')[0])
    );
  };

  const getHoveredPersonDescription = (person) => {
    if (!person) return null;
    const manager = getManagerByName(person.name);
    return manager?.description || person.description || 'No additional information available.';
  };

  const getHoveredPersonTitle = (person) => {
    const manager = person ? getManagerByName(person.name) : null;
    return manager?.role || person?.title || '';
  };

  // ── FEATURE 1: Filter logic ──────────────────────────────────────────────
  // Returns true if person should be fully visible (not ghosted)
  const matchesFilter = (personName) => {
    if (!currentFilter) return true;
    const manager = getManagerByName(personName);
    if (!manager) return false;
    switch (currentFilter) {
      case 'information': return manager.profileAvailable === true;
      case 'aware': return manager.aware >= 1;
      case 'interest': return manager.interest === manager.interestLimit;
      case 'experiment': return manager.experimentation === manager.experimentationLimit;
      case 'adopter': return manager.adopted === 1;
      case 'completed': return manager.adopted === 1 && manager.aware >= 1 && manager.interest === manager.interestLimit && manager.experimentation === manager.experimentationLimit;
      default: return false;
    }
  };

  const isPersonVisible = (personName) => matchesFilter(personName);

  // Toggle click filter (click same key to deactivate)
  const handleFilterClick = (key) => {
    playClickSound();
    setActiveStatus(prev => prev === key ? null : key);
  };

  const HEADER_H = 80;
  const PANEL_W = 256;

  // ── Desktop JSX ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#f4f4f2] flex flex-col overflow-hidden">

      {/* Header */}
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              id="shared-btn-eis-simulation"
              label="EIS Simulation"
              onClick={() => { playClickSound(); router.push('/aboutDetail'); }}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
          </div>
        )}
        centerContent={(
          <div
            className="flex flex-col items-center cursor-pointer select-none group"
            onMouseEnter={() => setHeaderProfileHovered(true)}
            onMouseLeave={() => setHeaderProfileHovered(false)}
            title="Hover to reveal AI adoption status on all avatars"
          >
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-gray-300 overflow-hidden shadow-md group-hover:border-blue-400 group-hover:scale-105 transition-all duration-150">
              <Image src={IMAGES.ALL.UZZI.NET2} alt="Relation Checker" fill className="object-cover" />
              <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
            </div>
          </div>
        )}
        rightContent={(
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="orgchart-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* ORG NETWORK */}
                <div style={{ gridColumnStart: 3 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-org-network"
                    label="ORG NETWORK"
                    onClick={() => { playClickSound(); router.push('/orgnetworks'); }}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
                {/* BACK TO PLAY */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-back-to-play"
                    label="BACK TO PLAY"
                    onClick={() => { playClickSound(); router.push('/playDemo'); }}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => { playClickSound(); window.print(); }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      {/* Body */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="w-52 bg-[#f4f4f2] flex flex-col overflow-hidden flex-shrink-0 pr-2">

          {/* Brand */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xl font-bold text-gray-400 italic tracking-wide">FrontMedia</p>
          </div>

          {/* ── FEATURE 1: Filter links ─────────────────────────────────── */}
          {/* Hover = temporary preview, Click = toggle persistent filter    */}
          <div className="px-4 pb-3 space-y-[3px] text-[12px] text-gray-700">
            <p>Focus on the managers ...</p>

            {/* information */}
            <p>... we have{' '}
              <span
                className={`font-semibold underline cursor-pointer transition-colors ${activeStatus === 'information' ? 'text-gray-900 bg-gray-200 px-0.5 rounded' : 'text-gray-700'}`}
                onMouseEnter={() => setHoveredStatus('information')}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleFilterClick('information')}
                title="Click to filter / hover to preview"
              >information</span>{' '}about
            </p>

            {/* aware */}
            <p>... who are{' '}
              <span
                className={`font-semibold underline cursor-pointer transition-colors ${activeStatus === 'aware' ? 'bg-orange-100 px-0.5 rounded' : ''} text-orange-500`}
                onMouseEnter={() => setHoveredStatus('aware')}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleFilterClick('aware')}
              >aware</span>
            </p>

            {/* interest */}
            <p>... who are fully{' '}
              <span
                className={`font-semibold underline cursor-pointer transition-colors ${activeStatus === 'interest' ? 'bg-blue-100 px-0.5 rounded' : ''} text-blue-500`}
                onMouseEnter={() => setHoveredStatus('interest')}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleFilterClick('interest')}
              >interested</span>
            </p>

            {/* experiment */}
            <p>... who are{' '}
              <span
                className={`font-semibold underline cursor-pointer transition-colors ${activeStatus === 'experiment' ? 'bg-blue-100 px-0.5 rounded' : ''} text-blue-600`}
                onMouseEnter={() => setHoveredStatus('experiment')}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleFilterClick('experiment')}
              >experimenting</span>
            </p>

            {/* adopter */}
            <p>... who have{' '}
              <span
                className={`font-semibold underline cursor-pointer transition-colors ${activeStatus === 'adopter' ? 'bg-red-100 px-0.5 rounded' : ''} text-red-700`}
                onMouseEnter={() => setHoveredStatus('adopter')}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleFilterClick('adopter')}
              >adopted</span>
            </p>

            {/* Clear filter button — only visible when a filter is active */}
            {activeStatus && (
              <button
                className="mt-1 text-[10px] text-gray-400 underline hover:text-gray-600"
                onClick={() => { playClickSound(); setActiveStatus(null); }}
              >
                clear filter ×
              </button>
            )}
          </div>

          <div className="mx-4 border-t border-gray-300 mb-3" />

          {/* ── FEATURE 2: Person hover preview ────────────────────────── */}
          {/* Shows when user hovers over any person avatar in the chart    */}
          <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
            {hoveredPerson ? (
              <>
                {/* Person image */}
                <div className="relative w-full h-36 rounded overflow-hidden shadow-sm mb-2 flex-shrink-0">
                  <Image
                    src={getPersonHoverImage(hoveredPerson.name)}
                    alt={hoveredPerson.name}
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Name + title */}
                <div className="text-center w-full">
                  <div className="font-bold text-[13px] text-gray-800 leading-tight">{hoveredPerson.name}</div>
                  <div className="text-[10px] text-gray-500 mb-1">{hoveredPerson.title}</div>
                  {/* Status label — shown below image */}
                  {statusOf(hoveredPerson.name) && statusOf(hoveredPerson.name) !== 'unaware' && (
                    <div
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: STATUS_TEXT_COLOR[statusOf(hoveredPerson.name)] }}
                    >
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[statusOf(hoveredPerson.name)]}`} />
                      {statusOf(hoveredPerson.name)}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Placeholder when no one is hovered */
              <div className="flex flex-col items-center justify-center h-full text-gray-300 select-none">
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-[10px] text-center leading-tight">Hover a person<br />to see details</p>
              </div>
            )}
          </div>

          {/* Status bars with dot indicator */}
          <div className="px-4 pb-2 mt-auto">
            {[
              { label: 'Aware', color: 'bg-blue-300', textColor: 'text-blue-500', statusKey: 'aware', dotColor: 'bg-blue-300', check: (m) => m.aware >= 1 },
              { label: 'Interested', color: 'bg-blue-400', textColor: 'text-blue-600', statusKey: 'interest', dotColor: 'bg-blue-400', check: (m) => m.interest === m.interestLimit },
              { label: 'Exper.', color: 'bg-red-400', textColor: 'text-red-500', statusKey: 'experiment', dotColor: 'bg-red-400', check: (m) => m.experimentation === m.experimentationLimit },
              { label: 'Adopter', color: 'bg-red-700', textColor: 'text-red-800', statusKey: 'adopter', dotColor: 'bg-red-700', check: (m) => m.adopted === 1 },
            ].map(({ label, color, textColor, statusKey, dotColor, check }) => {
              let showDot = false;
              let dotColorFinal = 'bg-gray-300';
              if (hoveredPerson) {
                const manager = getManagerByName(hoveredPerson.name);
                if (manager && check(manager)) {
                  showDot = true;
                  dotColorFinal = dotColor;
                }
              }
              return (
                <div key={label} className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0 flex items-center justify-center">
                    {showDot && <div className={`w-2 h-2 rounded-full ${dotColorFinal}`} />}
                  </div>
                  <div className={`flex-1 h-5 ${color} rounded-sm`} />
                  <span className={`text-[10px] font-semibold ${textColor} w-14 text-right`}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Adoption journey arrow */}
          <div className="flex px-3 pb-3">
            <div className="flex items-center">
              <div className="bg-blue-300 text-white px-1 py-[3px] text-[8px] font-bold">Aware</div>
              <div className="bg-blue-400 text-white px-1 py-[3px] text-[8px] font-bold">Int.</div>
              <div className="bg-red-400  text-white px-1 py-[3px] text-[8px] font-bold">Exp.</div>
              <div className="bg-red-700  text-white px-1 py-[3px] text-[8px] font-bold">Adopter</div>
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[16px] border-l-red-700" />
            </div>
          </div>
        </div>

        {/* ── ORG CHART CENTER ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto px-4 py-3 min-w-0">
          <div className="relative h-[640px] w-[1060px]">

            {/* CEO */}
            <ChartPerson
              person={{ name: 'Emma Stuart', title: 'CEO', initials: 'ES' }}
              style={{ top: 5, left: CEO_LEFT }}
              align="column"
              avatarSize="xl"
              status={statusOf('Emma Stuart')}
              image={imageOf('Emma Stuart')}
              color={colorOf('Emma Stuart')}
              onHover={setHoveredPerson}
              onLeave={() => setHoveredPerson(null)}
              showStatusDot={headerProfileHovered}
              isVisible={isPersonVisible('Emma Stuart')}
            />

            <VLine x={CEO_CX} y1={CEO_BOTTOM_Y} y2={L1_HLINE_Y} />
            <HLine y={L1_HLINE_Y} x1={STEF_CX} x2={BERT_CX} />

            {/* Stefanie */}
            <ChartPerson
              person={{ name: 'Stefanie Durand', title: 'Pers. Assistant', initials: 'SD' }}
              style={{ top: 112, left: STEF_LEFT }}
              status={statusOf('Stefanie Durand')}
              image={imageOf('Stefanie Durand')}
              color={colorOf('Stefanie Durand')}
              onHover={setHoveredPerson}
              onLeave={() => setHoveredPerson(null)}
              showStatusDot={headerProfileHovered}
              isVisible={isPersonVisible('Stefanie Durand')}
            />

            {/* Bert */}
            <ChartPerson
              person={{ name: 'Bert Heinze PhD', title: 'Ext. Fin. Controller', initials: 'BH' }}
              style={{ top: 112, left: BERT_LEFT }}
              status={statusOf('Bert Heinze')}
              image={imageOf('Bert Heinze')}
              color={colorOf('Bert Heinze')}
              onHover={setHoveredPerson}
              onLeave={() => setHoveredPerson(null)}
              showStatusDot={headerProfileHovered}
              isVisible={isPersonVisible('Bert Heinze')}
            />

            <VLine x={CEO_CX} y1={L1_HLINE_Y} y2={L2_HLINE_Y} />
            <HLine y={L2_HLINE_Y} x1={LEADER_CX[0]} x2={LEADER_CX[3]} />
            {LEADER_CX.map((cx) => (
              <VLine key={`vl-${cx}`} x={cx} y1={L2_HLINE_Y} y2={LEADER_TOP_Y} />
            ))}

            {/* Department Leaders */}
            {teams.map((team, i) => (
              <ChartPerson
                key={team.leader.name}
                person={team.leader}
                style={{ top: LEADER_TOP_Y, left: leaderContainerLeft(i) }}
                status={statusOf(team.leader.name)}
                image={imageOf(team.leader.name)}
                color={colorOf(team.leader.name)}
                onHover={setHoveredPerson}
                onLeave={() => setHoveredPerson(null)}
                showStatusDot={headerProfileHovered}
                isVisible={isPersonVisible(team.leader.name)}
              />
            ))}

            {LEADER_CX.map((cx) => (
              <VLine key={`vb-${cx}`} x={cx} y1={LEADER_BOTTOM_Y} y2={TEAM_BOX_TOP_Y} />
            ))}

            {/* Team Member Boxes */}
            <div className="absolute grid grid-cols-4 gap-4" style={{ top: TEAM_BOX_TOP_Y, left: 14, width: 1030 }}>
              {teams.map(({ leader, members }) => (
                <div key={`${leader.name}-members`} className="rounded border border-gray-300 bg-white px-3 py-3 min-h-[270px]">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-all duration-300"
                        onMouseEnter={() => setHoveredPerson(member)}
                        onMouseLeave={() => setHoveredPerson(null)}
                      >
                        {isPersonVisible(member.name) ? (
                          <AvatarCircle
                            initials={member.initials}
                            size="sm"
                            status={statusOf(member.name)}
                            image={imageOf(member.name)}
                            showStatusDot={headerProfileHovered}
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <PersonLabel name={member.name} title={member.title} color={colorOf(member.name)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right hover panel */}
      {hoveredPerson && (
        <div
          className="fixed right-2 sm:right-0 z-40 flex flex-col bg-white border border-black shadow-xl overflow-visible sm:mr-10 rounded-lg sm:rounded-none"
          style={{ top: HEADER_H + 80, width: 'calc(100% - 5px)', maxWidth: PANEL_W }}
        >
          <div className="flex flex-col overflow-visible" style={{ pointerEvents: 'none' }}>
            <div className="px-4 pt-3 pb-2 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-700 text-[12px] uppercase tracking-wide leading-snug">Here is the Info you have:</h3>
            </div>
            <div className="sm:hidden relative w-full h-32 flex-shrink-0">
              <Image src={imageOf(hoveredPerson.name)} alt={hoveredPerson.name} fill className="object-cover object-top" />
            </div>
            <div className="overflow-visible px-4 py-3">
              <div className="font-bold text-[14px] text-gray-800 leading-tight">{hoveredPerson.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{getHoveredPersonTitle(hoveredPerson)}</div>
              {statusOf(hoveredPerson.name) && statusOf(hoveredPerson.name) !== 'unaware' && (
                <div className="mt-1 mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: STATUS_TEXT_COLOR[statusOf(hoveredPerson.name)] }}>
                  ● {statusOf(hoveredPerson.name)}
                </div>
              )}
              <div className="border-t border-gray-100 pt-2">
                <p className="text-[12px] text-gray-700 leading-relaxed">{getHoveredPersonDescription(hoveredPerson)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <SimulationFooter usedDays={gameState?.time || 0} />
    </div>
  );
} 