import Image from 'next/image';
import { ChartPersonPlayDemo, AvatarCirclePlayDemo, PersonLabelPlayDemo } from '@/components/playdemo/OrgChartComponentsPlayDemo';
import { teams, getPersonImage, getPersonStatus } from '@/data/orgChartData';

export default function OrgChartViewPlayDemo({ gameState, hoveredPerson, setHoveredPerson, onBack }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#f4f4f2] overflow-auto">
      <div className="p-4 sm:p-6 flex-1">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-serif tracking-wide">
              ORGANIZATION CHART
            </h1>
            <button
              onClick={onBack}
              className="text-[13px] text-[#3157cd] underline hover:text-[#1f4fff]"
            >
              &larr; Back to Play Demo
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-[#efefef] p-4 sm:p-6">
            <div className="mx-auto min-w-[1100px]">
              <div className="relative h-[620px] rounded border border-gray-300 bg-[#f7f7f7] shadow-inner">
                {/* Top node - CEO */}
                <ChartPersonPlayDemo
                  person={{ name: 'Emma Stuart', title: 'CEO', initials: 'ES' }}
                  style={{ top: 12, left: 470 }}
                  align="column"
                  center
                  avatarSize="lg"
                  status={getPersonStatus('Emma Stuart', gameState)}
                  image={getPersonImage('Emma Stuart')}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />

                {/* Level 1 connectors */}
                <div className="absolute bg-gray-500" style={{ top: 96, left: 540, width: 1, height: 18 }} />
                <div className="absolute bg-gray-500" style={{ top: 114, left: 330, width: 420, height: 1 }} />

                {/* Level 2 nodes */}
                <ChartPersonPlayDemo
                  person={{ name: 'Stefanie Durand', title: 'Pers. Assistant', initials: 'SD' }}
                  style={{ top: 106, left: 240 }}
                  status={getPersonStatus('Stefanie Durand', gameState)}
                  image={getPersonImage('Stefanie Durand')}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />
                <ChartPersonPlayDemo
                  person={{ name: 'Bert Heinze PhD', title: 'Ex. Fin. Controller', initials: 'BH' }}
                  style={{ top: 106, left: 700 }}
                  status={getPersonStatus('Bert Heinze', gameState)}
                  image={getPersonImage('Bert Heinze')}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />

                {/* Connector bridge to 4 leaders */}
                <div className="absolute bg-gray-500" style={{ top: 114, left: 540, width: 1, height: 62 }} />
                <div className="absolute bg-gray-500" style={{ top: 176, left: 124, width: 830, height: 1 }} />

                {/* Vertical drops to leaders */}
                {[174, 384, 594, 804].map((x) => (
                  <div key={x} className="absolute bg-gray-500" style={{ top: 176, left: x, width: 1, height: 24 }} />
                ))}

                {/* Level 3 leader nodes */}
                <ChartPersonPlayDemo 
                  person={teams[0].leader} 
                  style={{ top: 194, left: 106 }} 
                  status={getPersonStatus(teams[0].leader.name, gameState)}
                  image={getPersonImage(teams[0].leader.name)}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />
                <ChartPersonPlayDemo 
                  person={teams[1].leader} 
                  style={{ top: 194, left: 316 }} 
                  status={getPersonStatus(teams[1].leader.name, gameState)}
                  image={getPersonImage(teams[1].leader.name)}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />
                <ChartPersonPlayDemo 
                  person={teams[2].leader} 
                  style={{ top: 194, left: 526 }} 
                  status={getPersonStatus(teams[2].leader.name, gameState)}
                  image={getPersonImage(teams[2].leader.name)}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />
                <ChartPersonPlayDemo 
                  person={teams[3].leader} 
                  style={{ top: 194, left: 736 }} 
                  status={getPersonStatus(teams[3].leader.name, gameState)}
                  image={getPersonImage(teams[3].leader.name)}
                  onHover={setHoveredPerson}
                  onLeave={() => setHoveredPerson(null)}
                />

                {/* Vertical drops to team boxes */}
                {[174, 384, 594, 804].map((x) => (
                  <div key={`${x}-drop`} className="absolute bg-gray-500" style={{ top: 258, left: x, width: 1, height: 22 }} />
                ))}

                {/* Team boxes */}
                <div className="absolute grid grid-cols-4 gap-3" style={{ top: 280, left: 42, width: 972 }}>
                  {teams.map(({ leader, members }) => (
                    <div key={`${leader.name}-members`} className="min-h-[248px] rounded border border-gray-300 bg-white px-3 py-3">
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div 
                            key={member.name} 
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            onMouseEnter={() => setHoveredPerson(member)}
                            onMouseLeave={() => setHoveredPerson(null)}
                          >
                            <AvatarCirclePlayDemo initials={member.initials} size="sm" status={getPersonStatus(member.name, gameState)} image={getPersonImage(member.name)} />
                            <PersonLabelPlayDemo name={member.name} title={member.title} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating image panel on hover */}
                {hoveredPerson && (
                  <div className="absolute top-4 right-4 w-48 bg-white rounded-lg shadow-xl border border-gray-300 p-3 z-50">
                    <div className="relative w-full h-48 mb-2">
                      <Image
                        src={getPersonImage(hoveredPerson.name)}
                        alt={hoveredPerson.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm text-[#222]">{hoveredPerson.name}</div>
                      <div className="text-xs text-[#666]">{hoveredPerson.title}</div>
                      <div className="mt-1 text-xs font-medium" style={{ 
                        color: getPersonStatus(hoveredPerson.name, gameState) === 'adopter' ? '#16a34a' :
                              getPersonStatus(hoveredPerson.name, gameState) === 'experiment' ? '#3b82f6' :
                              getPersonStatus(hoveredPerson.name, gameState) === 'interest' ? '#eab308' :
                              getPersonStatus(hoveredPerson.name, gameState) === 'aware' ? '#f97316' : '#9ca3af'
                      }}>
                        {getPersonStatus(hoveredPerson.name, gameState).toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
