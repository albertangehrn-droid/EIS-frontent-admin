import Image from 'next/image';
import { useEffect, useState } from 'react';
import IMAGES from '@/utils/imagePaths';
import { demoSessionData } from '@/data/demoSessionData';

// Highlight helpers same as before
const highlightText = (text, keywords, style) => {
  const regex = new RegExp(`(${keywords.join('|')})`, 'g');
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    keywords.includes(part) ? <span key={idx} className={style}>{part}</span> : part
  );
};

const highlightTextMultiple = (text, styleMap) => {
  let result = text;
  Object.entries(styleMap).forEach(([keywords, style]) => {
    const keywordList = keywords.split('|');
    const regex = new RegExp(`(${keywordList.join('|')})`, 'g');
    result = result.replace(regex, `<span class="${style}">$1</span>`);
  });
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

export default function DemoSessionViewPlayDemo({ hideSectionC, onHide }) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('demoMessageDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('demoMessageDismissed', 'true');
    setIsDismissed(true);
    onHide && onHide();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      id="play-demo-session-view"
      className="
        absolute
        inset-0
        flex
        overflow-hidden
        transition-all
        duration-[400ms]
      "
    >
      {/* LEFT IMAGE */}
      <div
        id="play-demo-session-left-image"
        className="
          w-[38%]
          md:w-[42%]
          lg:w-[48%]
          xl:w-[52%]
          2xl:w-[58%]
          shrink-0
          relative
          overflow-hidden
          transition-[margin]
          duration-[400ms]
        "
        style={{ marginLeft: hideSectionC ? 'auto' : 0 }}
      >
        <Image
          src={IMAGES.ALL.KEN}
          alt="Play Demo Session"
          fill
          className="object-cover"
        />
      </div>

      {/* RIGHT PANEL */}
      {!hideSectionC && (
        <div
          id="play-demo-session-right-panel"
          className="
            flex-1
            min-w-0
            flex
            flex-col
            border-l
            border-[#c8c8c8]
            bg-[#F4F4F4]
            font-sans
            overflow-hidden
          "
        >
          {/* SCROLLABLE CONTENT */}
          <div
            className="
              flex-1
              overflow-y-auto
              px-4
              py-4
              sm:px-5
              sm:py-5
              md:px-6
              md:py-5
              lg:px-7
              lg:py-6
            "
          >
            {/* INTRO */}
            <div
              id="play-demo-session-intro"
              className="
                text-center
                text-[16px]
                sm:text-[17px]
                md:text-[18px]
                lg:text-[20px]
                leading-[1.2]
                font-bold
                text-[#C5332E]
                mb-5
                md:mb-6
              "
            >
              {highlightText(demoSessionData.introText, ['PLAY DEMO'], 'font-bold')}
              <br />
              {demoSessionData.subText}
              <br />
              {demoSessionData.subText2}
              <br />
              {highlightText(demoSessionData.subText3, ['MISSION'], 'font-bold')}
              {demoSessionData.subText4}
              <br />
              {demoSessionData.subText5}
            </div>

            {/* MIDDLE TEXT */}
            <p
              id="play-demo-session-middle-text"
              className="
                text-center
                text-[13px]
                sm:text-[14px]
                md:text-[15px]
                lg:text-[16px]
                leading-[1.35]
                my-4
                md:my-5
              "
            >
              {demoSessionData.middleText}
            </p>

            {/* ACHIEVEMENTS */}
            <div
              id="play-demo-session-achievements"
              className="
                text-center
                text-[13px]
                sm:text-[14px]
                md:text-[15px]
                lg:text-[16px]
                leading-[1.35]
              "
            >
              {demoSessionData.achievements.map((text, idx) => (
                <p
                  key={idx}
                  id="session-achievement-text"
                  className="my-4 md:my-5"
                >
                  {highlightTextMultiple(text, {
                    'STRATEGY|TIME|INITIATIVES|SCORE|ACTIVITY LOG': 'font-extrabold text-[#000]',
                    'information|insights|changing the attitude': 'font-extrabold text-[#333]'
                  })}
                </p>
              ))}
            </div>

            {/* CONCLUSION */}
            <p
              id="play-demo-session-conclusion"
              className="
                text-center
                text-[13px]
                sm:text-[14px]
                md:text-[15px]
                lg:text-[16px]
                leading-[1.35]
                my-4
                md:my-5
              "
            >
              {highlightText(demoSessionData.conclusion, ['INITIATIVES'], 'font-extrabold text-[#000]')}
            </p>

            {/* SCORE NOTE */}
            <p
              id="play-demo-session-score-note"
              className="
                text-center
                text-[13px]
                sm:text-[14px]
                md:text-[15px]
                lg:text-[16px]
                leading-[1.35]
                my-4
                md:my-5
              "
            >
              {highlightText(demoSessionData.scoreNote, ['SCORE', 'ACTIVITY LOG'], 'font-extrabold text-[#000]')}
            </p>
          </div>

          {/* FOOTER */}
          <div
            id="play-demo-session-dismiss-footer"
            className="
              shrink-0
              border-t
              border-[#c7c7c7]
              px-3
              py-3
              text-center
              bg-[#F4F4F4]
            "
          >
            <button
              id="play-demo-session-dismiss-btn"
              onClick={handleDismiss}
              className="
                bg-transparent
                border-none
                cursor-pointer
                text-[11px]
                sm:text-[12px]
                md:text-[13px]
                text-[#c62828]
                no-underline
                font-sans
                hover:underline
              "
            >
              {highlightText(demoSessionData.dismissText, ['HERE'], 'font-bold')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}