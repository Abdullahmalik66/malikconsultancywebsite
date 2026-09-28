import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IntroParagraph {
  text: string;
  emphasized?: boolean;
}

interface IntroEyebrow {
  text: string;
  className: string;
}

interface ContrastToneClasses {
  cardTextClassName: string;
  numberTextClassName: string;
  headingTextClassName: string;
  descriptionTextClassName: string;
  ctaButtonClassName: string;
  listTextClassName: string;
  outcomeTextClassName: string;
  outcomeBorderClassName: string;
}

interface ContrastCardTheme {
  kind: 'contrast';
  dark: ContrastToneClasses;
  light: ContrastToneClasses;
}

interface ExplicitCardTheme {
  kind: 'explicit';
  numberTextClassName: string;
  mobileOutcomeWrapperClassName: string;
  desktopOutcomeWrapperClassName: string;
}

interface BaseSubService {
  id: string;
  num: string;
  title: string;
  description: string;
  points: string[];
  outcome: string;
  solidBg: string;
  borderColor: string;
  accentText: string;
}

export interface ContrastSubService extends BaseSubService {
  isDark: boolean;
}

export interface ExplicitSubService extends BaseSubService {
  headingColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

export type SubServiceData = ContrastSubService | ExplicitSubService;

export interface SubServicesShowcaseConfig {
  theme: {
    rootClassName: string;
    desktopScrollAreaClassName: string;
    introHeadingClassName: string;
    introBodyClassName: string;
    introEmphasisClassName: string;
    cards: ContrastCardTheme | ExplicitCardTheme;
  };
  intro: {
    eyebrow?: IntroEyebrow;
    heading: string;
    paragraphs: IntroParagraph[];
  };
  mobileCtaCursorPointer: boolean;
  listHeading: string;
  services: SubServiceData[];
}

const INTRO_SECTION_CLASS = 'w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-4 text-left';
const INTRO_CONTENT_CLASS = 'w-full';
const MOBILE_CONTAINER_CLASS = 'px-6 md:px-12 pb-32 flex flex-col gap-12 max-w-[1750px] mx-auto';
const MOBILE_CONTAINER_WITH_TOP_PADDING_CLASS = 'px-6 md:px-12 pb-32 flex flex-col gap-12 max-w-[1750px] mx-auto pt-8';
const MOBILE_CARD_BASE_CLASS = 'relative p-8 md:p-12 rounded-[40px]';
const MOBILE_NUMBER_BASE_CLASS = 'absolute top-6 right-8 text-5xl font-display font-light select-none pointer-events-none';
const MOBILE_HEADING_BASE_CLASS = 'text-2xl md:text-3xl font-display font-medium pr-12 mb-4 leading-tight';
const MOBILE_DESCRIPTION_BASE_CLASS = 'text-base leading-relaxed font-sans font-light mb-6';
const MOBILE_CTA_WRAPPER_CLASS = 'mt-4';
const MOBILE_CTA_BUTTON_CLASS = 'inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer';
const MOBILE_CTA_BUTTON_WITHOUT_CURSOR_CLASS = 'inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md';
const MOBILE_DETAILS_WRAPPER_CLASS = 'flex flex-col gap-6';
const MOBILE_LIST_CLASS = 'grid grid-cols-1 gap-3 text-sm font-sans';
const MOBILE_POINT_ICON_BASE_CLASS = 'w-4 h-4';
const MOBILE_OUTCOME_PLAIN_BASE_CLASS = 'text-sm md:text-base font-medium mt-6 leading-relaxed';
const MOBILE_OUTCOME_TEXT_BASE_CLASS = 'text-sm md:text-base font-medium font-sans leading-relaxed';
const DESKTOP_STICKY_CLASS = 'sticky top-0 h-[100svh] min-h-[100svh] md:h-screen w-full flex items-start pt-[12vh] justify-center overflow-hidden';
const DESKTOP_SHELL_CLASS = 'w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-center relative';
const DESKTOP_VIEWPORT_CLASS = 'relative w-full h-[74vh] min-h-[580px] flex items-center justify-center overflow-visible';
const DESKTOP_CARD_BASE_CLASS = 'absolute w-full h-full p-12 md:p-16 rounded-[48px]';
const DESKTOP_NUMBER_BASE_CLASS = 'absolute top-10 right-14 text-6xl md:text-8xl font-display font-light select-none pointer-events-none';
const DESKTOP_GRID_CLASS = 'grid grid-cols-1 lg:grid-cols-2 gap-16 items-center';
const DESKTOP_LEFT_COLUMN_CLASS = 'flex flex-col gap-6';
const DESKTOP_HEADING_BASE_CLASS = 'text-3xl lg:text-5xl font-display font-medium leading-tight';
const DESKTOP_DESCRIPTION_BASE_CLASS = 'text-base md:text-lg leading-relaxed font-sans font-light';
const DESKTOP_CTA_WRAPPER_CLASS = 'mt-4';
const DESKTOP_CTA_BUTTON_CLASS = 'inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer';
const DESKTOP_RIGHT_COLUMN_CLASS = 'flex flex-col gap-8';
const DESKTOP_LIST_CLASS = 'space-y-4 text-base font-sans';
const DESKTOP_POINT_ICON_BASE_CLASS = 'w-5 h-5';
const DESKTOP_OUTCOME_WRAPPER_BASE_CLASS = 'border-t pt-6';
const DESKTOP_OUTCOME_TEXT_BASE_CLASS = 'text-base md:text-lg font-medium font-sans leading-relaxed';
const LIST_HEADING_BASE_CLASS = 'text-xs font-mono uppercase tracking-[0.2em]';
const POINT_CLASS = 'flex items-start gap-3';
const STACK_TRANSITION = {
  duration: 0.7,
  ease: [0.05, 0.7, 0.1, 1] as [number, number, number, number]
};
const STACK_STATES = {
  inactive: { y: '100%', scale: 0.94, opacity: 0 },
  active: { y: '0%', scale: 1, opacity: 1 },
  peeking: { y: '92%', scale: 0.97, opacity: 1 },
  past: { y: '-100%', scale: 0.95, opacity: 0 }
};

function isContrastService(service: SubServiceData): service is ContrastSubService {
  return 'isDark' in service;
}

function getContrastTone(config: SubServicesShowcaseConfig, service: ContrastSubService) {
  const { cards } = config.theme;

  if (cards.kind !== 'contrast') {
    throw new Error(`Service "${service.id}" uses contrast styling with an explicit card theme.`);
  }

  return service.isDark ? cards.dark : cards.light;
}

function getExplicitCardTheme(config: SubServicesShowcaseConfig, service: ExplicitSubService) {
  const { cards } = config.theme;

  if (cards.kind !== 'explicit') {
    throw new Error(`Service "${service.id}" uses explicit styling with a contrast card theme.`);
  }

  return cards;
}

function getMobileCardClasses(config: SubServicesShowcaseConfig, service: SubServiceData) {
  const cardTextClassName = isContrastService(service)
    ? getContrastTone(config, service).cardTextClassName
    : service.textColor;

  return `${MOBILE_CARD_BASE_CLASS} ${service.solidBg} border ${service.borderColor} shadow-xl flex flex-col gap-8 text-left overflow-hidden ${cardTextClassName}`;
}

function getDesktopCardClasses(config: SubServicesShowcaseConfig, service: SubServiceData) {
  const cardTextClassName = isContrastService(service)
    ? getContrastTone(config, service).cardTextClassName
    : service.textColor;

  return `${DESKTOP_CARD_BASE_CLASS} ${service.solidBg} border ${service.borderColor} shadow-2xl flex flex-col justify-center text-left overflow-hidden ${cardTextClassName}`;
}

function getNumberTextClassName(config: SubServicesShowcaseConfig, service: SubServiceData) {
  return isContrastService(service)
    ? getContrastTone(config, service).numberTextClassName
    : getExplicitCardTheme(config, service).numberTextClassName;
}

function getHeadingTextClassName(config: SubServicesShowcaseConfig, service: SubServiceData) {
  return isContrastService(service) ? getContrastTone(config, service).headingTextClassName : service.headingColor;
}

function getDescriptionTextClassName(config: SubServicesShowcaseConfig, service: SubServiceData) {
  return isContrastService(service) ? getContrastTone(config, service).descriptionTextClassName : service.textColor;
}

function getCtaButtonClassName(config: SubServicesShowcaseConfig, service: SubServiceData, baseClassName: string) {
  const colorClassName = isContrastService(service)
    ? getContrastTone(config, service).ctaButtonClassName
    : `${service.badgeBg} ${service.badgeText} hover:opacity-90`;

  return `${baseClassName} ${colorClassName}`;
}

function getListClassName(config: SubServicesShowcaseConfig, service: SubServiceData, baseClassName: string) {
  if (isContrastService(service)) {
    return `${baseClassName} ${getContrastTone(config, service).listTextClassName}`;
  }

  return baseClassName;
}

function getOutcomeTextClassName(config: SubServicesShowcaseConfig, service: SubServiceData, baseClassName: string) {
  const colorClassName = isContrastService(service)
    ? getContrastTone(config, service).outcomeTextClassName
    : service.headingColor;

  return `${baseClassName} ${colorClassName}`;
}

function getDesktopOutcomeWrapperClassName(config: SubServicesShowcaseConfig, service: SubServiceData) {
  if (isContrastService(service)) {
    return `${DESKTOP_OUTCOME_WRAPPER_BASE_CLASS} ${getContrastTone(config, service).outcomeBorderClassName}`;
  }

  return getExplicitCardTheme(config, service).desktopOutcomeWrapperClassName;
}

function getMobileOutcomeWrapperClassName(config: SubServicesShowcaseConfig, service: SubServiceData) {
  if (isContrastService(service)) {
    return undefined;
  }

  return getExplicitCardTheme(config, service).mobileOutcomeWrapperClassName;
}

export default function SubServicesShowcase({ config }: { config: SubServicesShowcaseConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const segmentSize = 1 / config.services.length;
  const activeIndex = Math.min(config.services.length - 1, Math.floor(scrollProgress / segmentSize));
  const mobileContainerClassName = config.theme.cards.kind === 'explicit'
    ? MOBILE_CONTAINER_WITH_TOP_PADDING_CLASS
    : MOBILE_CONTAINER_CLASS;
  const mobileCtaButtonBaseClassName = config.mobileCtaCursorPointer
    ? MOBILE_CTA_BUTTON_CLASS
    : MOBILE_CTA_BUTTON_WITHOUT_CURSOR_CLASS;

  return (
    <div className={config.theme.rootClassName}>
      
      <section className={INTRO_SECTION_CLASS}>
        <div className={INTRO_CONTENT_CLASS}>
          {config.intro.eyebrow ? (
            <span className={config.intro.eyebrow.className}>{config.intro.eyebrow.text}</span>
          ) : null}
          <h2 className={config.theme.introHeadingClassName}>
            {config.intro.heading}
          </h2>
          
          <div className={config.theme.introBodyClassName}>
            {config.intro.paragraphs.map((paragraph, index) => (
              <p key={index} className={paragraph.emphasized ? config.theme.introEmphasisClassName : undefined}>
                {paragraph.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {isMobile ? (
        <div className={mobileContainerClassName}>
          {config.services.map((service) => {
            const mobileOutcomeWrapperClassName = getMobileOutcomeWrapperClassName(config, service);

            return (
              <div
                key={service.id}
                className={getMobileCardClasses(config, service)}
              >
                <div className={`${MOBILE_NUMBER_BASE_CLASS} ${getNumberTextClassName(config, service)}`}>
                  {service.num}
                </div>

                <div>
                  <h3 className={`${MOBILE_HEADING_BASE_CLASS} ${getHeadingTextClassName(config, service)}`}>
                    {service.title}
                  </h3>
                  <p className={`${MOBILE_DESCRIPTION_BASE_CLASS} ${getDescriptionTextClassName(config, service)}`}>
                    {service.description}
                  </p>
                  <div className={MOBILE_CTA_WRAPPER_CLASS}>
                    <Link to="/reach-me">
                      <button className={getCtaButtonClassName(config, service, mobileCtaButtonBaseClassName)}>
                        Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className={MOBILE_DETAILS_WRAPPER_CLASS}>
                  <div>
                    <h4 className={`${LIST_HEADING_BASE_CLASS} ${service.accentText} mb-4 font-semibold`}>{config.listHeading}</h4>
                    <ul className={getListClassName(config, service, MOBILE_LIST_CLASS)}>
                      {service.points.map((pt, idx) => (
                        <li key={idx} className={POINT_CLASS}>
                          <CheckCircle2 className={`${MOBILE_POINT_ICON_BASE_CLASS} ${service.accentText} mt-0.5 flex-shrink-0`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    {mobileOutcomeWrapperClassName ? (
                      <div className={mobileOutcomeWrapperClassName}>
                        <p className={getOutcomeTextClassName(config, service, MOBILE_OUTCOME_TEXT_BASE_CLASS)}>
                          {service.outcome}
                        </p>
                      </div>
                    ) : (
                      <p className={getOutcomeTextClassName(config, service, MOBILE_OUTCOME_PLAIN_BASE_CLASS)}>
                        {service.outcome}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div ref={containerRef} className={config.theme.desktopScrollAreaClassName}>
          <div className={DESKTOP_STICKY_CLASS}>
            
            <div className={DESKTOP_SHELL_CLASS}>
              
              <div className={DESKTOP_VIEWPORT_CLASS}>
                {config.services.map((service, index) => {
                  const isActive = index === activeIndex;
                  const isPast = index < activeIndex;
                  const isPeeking = index === activeIndex + 1;

                  let stackState = STACK_STATES.inactive;

                  if (isActive) {
                    stackState = STACK_STATES.active;
                  } else if (isPeeking) {
                    stackState = STACK_STATES.peeking;
                  } else if (isPast) {
                    stackState = STACK_STATES.past;
                  }

                  return (
                    <motion.div
                      key={service.id}
                      initial={false}
                      animate={{
                        y: stackState.y,
                        scale: stackState.scale,
                        opacity: stackState.opacity,
                        pointerEvents: isActive ? 'auto' : 'none'
                      }}
                      transition={STACK_TRANSITION}
                      className={getDesktopCardClasses(config, service)}
                      style={{ zIndex: 10 + index }}
                    >
                      <div className={`${DESKTOP_NUMBER_BASE_CLASS} ${getNumberTextClassName(config, service)}`}>
                        {service.num}
                      </div>

                      <div className={DESKTOP_GRID_CLASS}>
                        <div className={DESKTOP_LEFT_COLUMN_CLASS}>
                          <h3 className={`${DESKTOP_HEADING_BASE_CLASS} ${getHeadingTextClassName(config, service)}`}>
                            {service.title}
                          </h3>
                          <p className={`${DESKTOP_DESCRIPTION_BASE_CLASS} ${getDescriptionTextClassName(config, service)}`}>
                            {service.description}
                          </p>
                          <div className={DESKTOP_CTA_WRAPPER_CLASS}>
                            <Link to="/reach-me">
                              <button className={getCtaButtonClassName(config, service, DESKTOP_CTA_BUTTON_CLASS)}>
                                Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        <div className={DESKTOP_RIGHT_COLUMN_CLASS}>
                          <div>
                            <h4 className={`${LIST_HEADING_BASE_CLASS} ${service.accentText} mb-4 font-semibold`}>{config.listHeading}</h4>
                            <ul className={getListClassName(config, service, DESKTOP_LIST_CLASS)}>
                              {service.points.map((pt, idx) => (
                                <li key={idx} className={POINT_CLASS}>
                                  <CheckCircle2 className={`${DESKTOP_POINT_ICON_BASE_CLASS} ${service.accentText} mt-0.5 flex-shrink-0`} />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={getDesktopOutcomeWrapperClassName(config, service)}>
                            <p className={getOutcomeTextClassName(config, service, DESKTOP_OUTCOME_TEXT_BASE_CLASS)}>
                              {service.outcome}
                            </p>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
