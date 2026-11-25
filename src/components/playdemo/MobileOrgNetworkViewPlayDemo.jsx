

"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/utils/imagePaths";

// ─────────────────────────────────────────────────────────────────────────────
// Network definitions
// ─────────────────────────────────────────────────────────────────────────────
const NETWORKS = [
  {
    key: "network2",
    label: "Coffee Groups",
    image: IMAGES.ALL.UZZI.NET1,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: "#b8860b",
  },
  {
    key: "network3",
    label: "External Links",
    image: IMAGES.ALL.UZZI.NET2,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: "#c0392b",
  },
  {
    key: "network1",
    label: "Teams / Taskforces",
    image: IMAGES.ALL.UZZI.NET3,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: "#2c6e8a",
  },
];

// Group legends for External Links
const GROUP_LEGENDS = [
  {
    bgColor: "#f5d020",
    textColor: "#4a3500",
    people: [
      "Emma Stuart (CEO)",
      "Per Joos (CTO)",
      "Adam deGroote (Facilities)",
      "Anna Belloni (Marketing & Comm)",
    ],
  },
  {
    bgColor: "#4a7fc1",
    textColor: "#ffffff",
    people: [
      "Frank Raponi (CHRO)",
      "Luis Fernandez (Fixed Products)",
      "Fred Smithson (Regulatory Office)",
      "Ivan Tarowski (Intl. Roaming)",
    ],
  },
  {
    bgColor: "#5cb85c",
    textColor: "#ffffff",
    people: [
      "Adam deGroote (Facilities)",
      "Adrian Muster (Legal Office)",
      "Daniel Wang (Mobile Products)",
      "Thomas Kupik (Consumer Sales)",
    ],
  },
  {
    bgColor: "#e8706a",
    textColor: "#ffffff",
    people: [
      "Martin Buerli (CFO)",
      "Wilma Grollmyer (Procurement)",
    ],
  },
];

export default function MobileOrgNetworkViewPlayDemo({ onBack }) {
  const [selectedKey, setSelectedKey] = useState("network3");
  const [imgError, setImgError] = useState(false);

  const activeNet =
    NETWORKS.find((n) => n.key === selectedKey) ?? null;

  const isCoffeeGroups = selectedKey === "network2";
  const isExternalLinks = selectedKey === "network3";
  const isTeamsTaskforces = selectedKey === "network1";

  const handleSelect = (net) => {
    if (!net.clickable) return;

    setImgError(false);
    setSelectedKey(net.key);
  };

  return (
     <div className="flex flex-col h-full bg-[#f4f4f2] overflow-hidden">
         {/* HEADER */}
         <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-300">
           <div className="flex items-center justify-center">
             <h1 className="text-lg sm:text-xl font-bold text-gray-800 font-serif tracking-wide">
               ORGANIZATIONAL NETWORKS
             </h1>
           </div>
         </div>
   
         {/* NETWORK SELECTOR */}
         <div className="shrink-0 bg-white border-b border-gray-300 px-2 py-3">
           <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
             {NETWORKS.map((net) => {
               const isSelected = selectedKey === net.key;
   
               return (
                 <button
                   key={net.key}
                   onClick={() => handleSelect(net)}
                   disabled={!net.clickable}
                   className={`flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[100px] p-2 rounded-lg transition-all ${
                     isSelected ? "" : "hover:bg-gray-50"
                   } ${
                     !net.clickable
                       ? "opacity-50 cursor-not-allowed"
                       : "cursor-pointer"
                   }`}
                 >
                   <div
                     className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0"
                     style={{
                       boxShadow:
                         isSelected && net.clickable
                           ? `0 0 0 3px ${net.color}`
                           : "0 2px 4px rgba(0,0,0,0.1)",
                     }}
                   >
                     <Image
                       src={net.image}
                       alt={net.label}
                       fill
                       className="object-cover"
                     />
                   </div>
   
                   <span
                     className="text-[10px] sm:text-xs font-bold text-center leading-tight"
                     style={{
                       color:
                         isSelected && net.clickable
                           ? net.color
                           : "#555",
                     }}
                   >
                     {net.label}
                   </span>
                 </button>
               );
             })}
           </div>
         </div>
   
         {/* MAIN CONTENT */}
         <div className="flex-1 overflow-y-auto bg-white">
           {activeNet && !imgError ? (
             <div className="flex flex-col h-full">
   
               {/* COFFEE GROUPS */}
               {isCoffeeGroups && (
                 <div className="p-4">
                   <h2 className="text-2xl font-bold mb-4">
                     Coffee Groups
                   </h2>
   
                   <div className="space-y-3">
                     <div className="bg-[#b7bd6d] p-3">
                       <p className="text-xs mt-1">
                          Emma Stuart (CEO)<br />
                           Bert Heinze (Ext. Fin. Controller)<br />
                           Randy Longhorn (CCO)<br />
                           John Peters (Internet Products)
                       </p>
                     </div>
   
                     <div className="bg-[#ffff00] text-white p-3">
                       <p className="text-xs mt-1">
                        Stefanie Durand (Pers. Assistant)<br />
                           Frank Raponi (CHRO)<br />
                           Linda Pastorakis (Business Excellence)<br />
                           Adrian Muster (Legal Office)<br />
                           Anna Belloni (Marketing & Comm)
                       </p>
                     </div>
                     <div className="bg-[#cad8ec] text-white p-3">
                       <p className="text-xs mt-1">
                        Per Joos (CTO)<br />
                           Wilma Grollmyer (Procurement)
                       </p>
                     </div>
   
                     <div className="bg-[#e0bf5f] text-white p-3">
                       <p className="text-xs mt-1">
                          Martin Buerli (CFO)<br />
                           Jill Atherson (Personnel & Training)<br />
                           Adam deGroote (Facilities)<br />
                           Samuel Stein (Treasury)<br />
                           Pradeep Gupta (IT)<br />
                           Thomas Kupik (Consumer Sales)
                       </p>
                     </div>
                     <div className="bg-[#6d8fd6] text-white p-3">
                       <p className="text-xs mt-1">
                          Daniel Wang (Mobile Products)<br />
                           Laszlo Por (Corporate Sales)<br />
                           Ivan Tarowski (Intl. Roaming)
                       </p>
                     </div>
                     <div className="bg-[#f59787] text-white p-3">
                       <p className="text-xs mt-1">
                         Jill Atherson (Personnel & Training)<br />
                           Linda Pastorakis (Business Excellence)<br />
                           Anna Belloni (Marketing & Comm)
                       </p>
                     </div>
                     <div className="bg-[#ff0000] text-white p-3">
                       <p className="text-xs mt-1">
                         Samuel Stein (Treasury)<br />
                           Laszlo Por (Corporate Sales)
                       </p>
                     </div>
                     <div className="bg-[#a8cb8c] text-white p-3">
                       <p className="text-xs mt-1">
                        Martin Buerli (CFO)<br />
                           Pradeep Gupta (IT)<br />
                           Wilma Grollmyer (Procurement)<br />
                           Jean Bardotte (Operations)
                       </p>
                     </div>
                   </div>
   
                   <div className="mt-5 relative w-full aspect-[4/3] border bg-gray-100">
                     <Image
                       src={activeNet.mapImage}
                       alt="Coffee Groups"
                       fill
                       className="object-contain"
                     />
                   </div>
   
                   <div className="shrink-0 px-5 pt-2 bg-white relative z-10">
                       <p style={{ fontSize: '12px', color: '#222', margin: 0, lineHeight: 1.75 }}>
                         You have observed over the last few days that there are{" "}
                           <strong>8 groups of managers</strong>
                           who get together regularly for coffee, lunch, or informal meetings online.
                       </p>
                     </div>
                 </div>
   
                 
               )}
   
               {/* EXTERNAL LINKS */}
               {isExternalLinks && (
                 <div className="p-4">
                   <h2 className="text-2xl font-bold mb-4">
                     External Links
                   </h2>
   
                   <div className="space-y-3">
                     {GROUP_LEGENDS.map((group, i) => (
                       <div
                         key={i}
                         className="p-3"
                         style={{
                           background: group.bgColor,
                         }}
                       >
                         {group.people.map((person, pi) => (
                           <div
                             key={pi}
                             className="text-xs font-semibold leading-6"
                             style={{
                               color: group.textColor,
                             }}
                           >
                             {person}
                           </div>
                         ))}
                       </div>
                     ))}
                   </div>
   
                   <div className="mt-5 relative w-full aspect-[4/3] border bg-gray-100">
                     <Image
                       src={activeNet.mapImage}
                       alt="External Links"
                       fill
                       className="object-contain"
                       onError={() => setImgError(true)}
                     />
                   </div>
   
                   <div className="mt-4">
                     <p className="text-sm leading-7 text-[#222]">
                       You have observed over the past days
                       that certain individuals belong to the
                       same social groups.
                       <br />
                       They tend to share{" "}
                       <strong>Political Views</strong>,
                       meet regularly at the{" "}
                       <strong>Tennis Club</strong>,
                       or are involved in the same{" "}
                       <strong>Charity</strong>.
                     </p>
                   </div>
                 </div>
               )}
   
               {/* TEAMS / TASKFORCES */}
               {isTeamsTaskforces && (
                 <div className="p-4">
                   <h2 className="text-2xl font-bold mb-4">
                     Teams / Taskforces
                   </h2>
   
                   <div className="space-y-3">
   
                     <div className="bg-[#F59787] text-white p-3">
                       
   
                       <p className="text-xs text-black  mt-1">
                        John Peters (Internet Products) <br />
                          Daniel Wang (Mobile Products) <br />
                          Luis Fernandez (Fixed Products) <br />
                          Thomas Kupik (Consumer Sales) <br />
                          Laszlo Por (Corporate Sales) <br />
                          Ivan Tarowski (Intl. Roaming)
                       </p>
                     </div>
   
                     <div className="bg-[#CAD8EC]   p-3">
                       <p className="text-xs mt-1 text-black ">
                          Bert Heinze (Ext. Fin. Controller) <br />
                          Martin Buerli (CFO)
                          <br />
                          Per Joos (CTO) <br />
                          Samuel Stein (Treasury) <br />
                          Adrian Muster (Legal Office) <br />
                          Wilma Grollmyer (Procurement)
                       </p>
                     </div>
   
                     <div className="bg-[#FFFF00] p-3">
                       <p className="text-xs mt-1 text-black ">
                          Emma Stuart (CEO) <br />
                          Martin Buerli (CFO) <br />
                          Per Joos (CTO) <br />
                          Randy Longhorn (CCO) <br />
                          Frank Raponi (CHRO)
                       </p>
                     </div>
   
                    
                   </div>
   
                   <div className="mt-5 relative w-full aspect-[4/3] border bg-gray-100">
                     <Image
                       src={activeNet.mapImage}
                       alt="Teams/Taskforces"
                       fill
                       className="object-contain"
                     />
                   </div>
   
                   <div className="mt-4">
                     <p className="text-sm leading-7 text-[#222]">
                       Formal task forces have been established
                       to drive strategic initiatives.
                       <br />
                       These teams bring together cross-functional
                       expertise and leadership.
                     </p>
                   </div>
                 </div>
               )}
   
               {/* FALLBACK */}
               {!isCoffeeGroups &&
                 !isExternalLinks &&
                 !isTeamsTaskforces && (
                   <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                     <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                       <span className="text-3xl">🔒</span>
                     </div>
   
                     <h3 className="text-base font-bold text-gray-700 mb-2">
                       {activeNet?.label || "Select a Network"}
                     </h3>
   
                     <p className="text-xs text-gray-500 max-w-xs">
                       Select a network from the options above
                       to view its details.
                     </p>
                   </div>
                 )}
             </div>
           ) : (
             <div className="flex items-center justify-center h-full">
               <p className="text-gray-500">
                 Network diagram could not be loaded
               </p>
             </div>
           )}
         </div>
       </div>
  );
}



// "use client";

// import { useState } from 'react';
// import Image from 'next/image';
// import { IMAGES } from '@/utils/imagePaths';

// // ─────────────────────────────────────────────────────────────────────────────
// // Network definitions (copied from page.jsx)
// // ─────────────────────────────────────────────────────────────────────────────
// const NETWORKS = [
//   {
//     key:        'network2',
//     label:      'Coffee Groups',
//     image:      IMAGES.ALL.UZZI.NET1,
//     mapImage:   IMAGES.ALL.ORG_CHART,
//     clickable:  true,
//     color:      '#b8860b',
//   },
//   {
//     key:        'network3',
//     label:      'External Links',
//     image:      IMAGES.ALL.UZZI.NET2,
//     mapImage:   IMAGES.ALL.ORG_CHART,
//     clickable:  true,
//     color:      '#c0392b',
//   },
//   {
//     key:        'network1',
//     label:      'Teams / Taskforces',
//     image:      IMAGES.ALL.UZZI.NET3,
//     mapImage:   IMAGES.ALL.ORG_CHART,
//     clickable:  true,
//     color:      '#2c6e8a',
//   },
// ];

// // Group legends for External Links - matching desktop exactly
// const GROUP_LEGENDS = [
//   {
//     bgColor:  '#f5d020',
//     textColor:'#4a3500',
//     people: [
//       'Emma Stuart (CEO)',
//       'Per Joos (CTO)',
//       'Adam deGroote (Facilities)',
//       'Anna Belloni (Marketing & Comm)',
//     ],
//   },
//   {
//     bgColor:  '#4a7fc1',
//     textColor:'#ffffff',
//     people: [
//       'Frank Raponi (CHRO)',
//       'Luis Fernandez (Fixed Products)',
//       'Fred Smithson (Regulatory Office)',
//       'Ivan Tarowski (Intl. Roaming)',
//     ],
//   },
//   {
//     bgColor:  '#5cb85c',
//     textColor:'#ffffff',
//     people: [
//       'Adam deGroote (Facilities)',
//       'Adrian Muster (Legal Office)',
//       'Daniel Wang (Mobile Products)',
//       'Thomas Kupik (Consumer Sales)',
//     ],
//   },
//   {
//     bgColor:  '#e8706a',
//     textColor:'#ffffff',
//     people: [
//       'Martin Buerli (CFO)',
//       'Wilma Grollmyer (Procurement)',
//     ],
//   },
// ];

// export default function MobileOrgNetworkViewPlayDemo({ onBack }) {
//   const [selectedKey, setSelectedKey] = useState('network3'); // Default to External Links
//   const [imgError, setImgError] = useState(false);

//   const activeNet = NETWORKS.find((n) => n.key === selectedKey) ?? null;
//   const isCoffeeGroups = selectedKey === 'network2';
//   const isExternalLinks = selectedKey === 'network3';
//   const isTeamsTaskforces = selectedKey === 'network1';

//   const handleSelect = (net) => {
//     if (!net.clickable) return;
//     setImgError(false);
//     setSelectedKey(net.key);
//   };

//   return (
//     <div className="flex flex-col h-full bg-[#f4f4f2] overflow-hidden">
//       {/* Sub Header - Title centered */}
//       <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-300">
//         <div className="flex items-center justify-center">
//           <h1 className="text-lg sm:text-xl font-bold text-gray-800 font-serif tracking-wide">
//             ORGANIZATIONAL NETWORKS
//           </h1>
//         </div>
//       </div>

//       {/* Network Selector - Horizontal scroll */}
//       <div className="shrink-0 bg-white border-b border-gray-300 px-2 py-3">
//         <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
//           {NETWORKS.map((net) => {
//             const isSelected = selectedKey === net.key;
//             return (
//               <button
//                 key={net.key}
//                 onClick={() => handleSelect(net)}
//                 disabled={!net.clickable}
//                 className={`flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[100px] p-2 rounded-lg transition-all ${
//                   isSelected 
//                     ? '' 
//                     : 'hover:bg-gray-50'
//                 } ${!net.clickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                 style={{ 
//                   ringColor: isSelected ? net.color : 'transparent',
//                   ringWidth: isSelected ? '2px' : '0'
//                 }}
//               >
//                 <div
//                   className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0"
//                   style={{
//                     boxShadow: isSelected && net.clickable
//                       ? `0 0 0 3px ${net.color}`
//                       : '0 2px 4px rgba(0,0,0,0.1)',
//                   }}
//                 >
//                   <Image
//                     src={net.image}
//                     alt={net.label}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//                 <span
//                   className="text-[10px] sm:text-xs font-bold text-center leading-tight"
//                   style={{
//                     color: isSelected && net.clickable ? net.color : '#555',
//                   }}
//                 >
//                   {net.label}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 overflow-y-auto bg-white">
//         {activeNet && !imgError ? (
//           <div className="flex flex-col h-full">
            
//             {/* Coffee Groups UI */}
//             {isCoffeeGroups && (
//               <>
//                 {/* Title */}
//                 <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
//                   <h2 className="text-base sm:text-lg font-bold text-gray-800">
//                     Coffee Groups
//                   </h2>
//                 </div>
                
//                 {/* Coffee Groups Content */}
//                 <div className="flex-1 overflow-y-auto">
//                   <div className="p-3 sm:p-4 space-y-2">
//                     <div style={{ background: '#f5d020', borderRadius: '2px', padding: '7px 12px' }}>
//                       <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#4a3500', lineHeight: 1.7 }}>
//                         Morning Coffee Crew
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#4a3500', marginTop: '4px' }}>
//                         Emma Stuart (CEO)<br/>
//                         Per Joos (CTO)<br/>
//                         Adam deGroote (Facilities)
//                       </div>
//                     </div>
                    
//                     <div style={{ background: '#b8860b', borderRadius: '2px', padding: '7px 12px' }}>
//                       <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                         Afternoon Coffee Break
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                         Anna Belloni (Marketing)<br/>
//                         Frank Raponi (CHRO)<br/>
//                         Luis Fernandez (Fixed Products)
//                       </div>
//                     </div>
                    
//                     <div style={{ background: '#d4a017', borderRadius: '2px', padding: '7px 12px' }}>
//                       <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                         Espresso Enthusiasts
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                         Martin Buerli (CFO)<br/>
//                         Wilma Grollmyer (Procurement)<br/>
//                         Thomas Kupik (Consumer Sales)
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Org Chart Image */}
//                   <div className="p-3 sm:p-4">
//                     <div className="relative w-full aspect-[4/3] bg-gray-100 border border-gray-300 overflow-hidden">
//                       {!imgError ? (
//                         <Image
//                           src={activeNet.mapImage}
//                           alt="Coffee Groups network"
//                           fill
//                           className="object-contain"
//                           onError={() => setImgError(true)}
//                         />
//                       ) : (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <p className="text-sm text-gray-500">Network diagram could not be loaded</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   {/* Description */}
//                   <div className="px-3 sm:px-4 pt-2 pb-3">
//                     <p style={{ fontSize: '14px', color: '#222', margin: 0, lineHeight: 1.6 }}>
//                       Coffee breaks are informal networking opportunities where <strong>spontaneous conversations</strong> happen.<br />
//                       Different groups form naturally around <strong>schedules</strong> and <strong>preferences</strong>.<br />
//                       These moments can be crucial for <strong>information sharing</strong> and <strong>relationship building</strong>.
//                     </p>
//                   </div>
//                 </>
//               )}
              
//               {/* External Links UI */}
//               {isExternalLinks && (
//                 <div className="flex flex-col h-full">
//                   {/* Title */}
//                   <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
//                     <h2 className="text-base sm:text-lg font-bold text-gray-800">
//                       External Links
//                     </h2>
//                   </div>

//                   {/* Scrollable content */}
//                   <div className="flex-1 overflow-y-auto">
//                     {/* Legend Groups - Desktop style boxes */}
//                     <div className="p-3 sm:p-4 space-y-2">
//                       {GROUP_LEGENDS.map((group, i) => (
//                         <div
//                           key={i}
//                           style={{
//                             background: group.bgColor,
//                             borderRadius: '2px',
//                             padding: '7px 12px',
//                           }}
//                         >
//                           {group.people.map((person, pi) => (
//                       <div
//                         key={pi}
//                         style={{
//                           fontSize: '12.5px',
//                           fontWeight: 600,
//                           color: group.textColor,
//                           lineHeight: 1.7,
//                           whiteSpace: 'nowrap',
//                         }}
//                       >
//                         {person}
//                             </div>
//                           ))}
//                         </div>
//                       ))}
//               </div>

//                         {/* Org Chart Image */}
//                         <div className="p-3 sm:p-4">
//                           <div className="relative w-full aspect-[4/3] bg-gray-100 border border-gray-300 overflow-hidden">
//                             {!imgError ? (
//                               <Image
//                                 src={activeNet.mapImage}
//                                 alt="External Links network"
//                                 fill
//                                 className="object-contain"
//                                 onError={() => setImgError(true)}
//                               />
//                             ) : (
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 <p className="text-sm text-gray-500">Network diagram could not be loaded</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                          {/* Description - Full desktop text below image */}
//                         <div className="px-3 sm:px-4 pt-2 pb-3">
//                           <p style={{ fontSize: '14px', color: '#222', margin: 0, lineHeight: 1.6 }}>
//                             You have observed over the past days that certain individuals belong to the same social groups<br />
//                             as they tend to share <strong>Political Views</strong> (yellow and blue), meet regularly at the <strong>Tennis Club</strong> (green),<br />
//                             or are actively involved in the same <strong>Charity</strong> (orange)
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Teams/Taskforces UI */}
//                   {isTeamsTaskforces && (
//                     <>
//                       {/* Title */}
//                       <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
//                         <h2 className="text-base sm:text-lg font-bold text-gray-800">
//                           Teams / Taskforces
//                         </h2>
//                       </div>
                      
//                       {/* Teams/Taskforces Content */}
//                       <div className="flex-1 overflow-y-auto">
//                         <div className="p-3 sm:p-4 space-y-2">
//                           <div style={{ background: '#2c6e8a', borderRadius: '2px', padding: '7px 12px' }}>
//                             <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                               Expansion Taskforce
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                               Emma Stuart (CEO) - Lead<br/>
//                               Per Joos (CTO)<br/>
//                               Adam deGroote (Facilities)<br/>
//                               Anna Belloni (Marketing)
//                             </div>
//                           </div>
                          
//                           <div style={{ background: '#4a7fc1', borderRadius: '2px', padding: '7px 12px' }}>
//                             <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                               Purchasing Committee
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                               Frank Raponi (CHRO) - Lead<br/>
//                               Luis Fernandez (Fixed Products)<br/>
//                               Fred Smithson (Regulatory)<br/>
//                               Ivan Tarowski (Intl. Roaming)
//                             </div>
//                           </div>
                          
//                           <div style={{ background: '#5cb85c', borderRadius: '2px', padding: '7px 12px' }}>
//                             <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                               New Products Development
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                               Adrian Muster (Legal) - Lead<br/>
//                               Daniel Wang (Mobile Products)<br/>
//                               Thomas Kupik (Consumer Sales)<br/>
//                               Martin Buerli (CFO)
//                             </div>
//                           </div>
                          
//                           <div style={{ background: '#e8706a', borderRadius: '2px', padding: '7px 12px' }}>
//                             <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>
//                               Digital Transformation
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px' }}>
//                               Wilma Grollmyer (Procurement) - Lead<br/>
//                               Jill Atherson (Personnel)<br/>
//                               Linda Pastorakis (Business Excellence)
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Org Chart Image */}
//                         <div className="p-3 sm:p-4">
//                           <div className="relative w-full aspect-[4/3] bg-gray-100 border border-gray-300 overflow-hidden">
//                             {!imgError ? (
//                               <Image
//                                 src={activeNet.mapImage}
//                                 alt="Teams/Taskforces network"
//                                 fill
//                                 className="object-contain"
//                                 onError={() => setImgError(true)}
//                               />
//                             ) : (
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 <p className="text-sm text-gray-500">Network diagram could not be loaded</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
                        
//                         {/* Description */}
//                         <div className="px-3 sm:px-4 pt-2 pb-3">
//                           <p style={{ fontSize: '14px', color: '#222', margin: 0, lineHeight: 1.6 }}>
//                             Formal <strong>task forces</strong> have been established to drive strategic initiatives.<br />
//                             These teams bring together <strong>cross-functional expertise</strong> and <strong>leadership</strong>.<br />
//                             Understanding these formal networks is key to navigating <strong>organizational structure</strong>.
//                           </p>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               /* ── Other networks (non-clickable) or no selection ── */
//               <div className="flex flex-col items-center justify-center h-full p-6 text-center">
//                 <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
//                   <span className="text-3xl">🔒</span>
//                 </div>
//                 <h3 className="text-base font-bold text-gray-700 mb-2">
//                   {activeNet?.label || 'Select a Network'}
//                 </h3>
//                 <p className="text-xs text-gray-500 max-w-xs">
//                   {activeNet?.clickable === false 
//                     ? "You'll have to acquire this information using one of the available initiatives!"
//                     : "Select a network from the options above to view its details."
//                   }
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       );
//     }
//   );
// }

