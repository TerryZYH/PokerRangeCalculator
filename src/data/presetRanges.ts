import { Range } from '../types';

/**
 * 预设范围配置
 * 根据德州扑克常规策略设定
 */

// UTG位置 Open范围 (~15-20%)
const UTG_OPEN_HANDS = [
  // 对子
  'AA', 'KK', 'QQ', 'JJ', 'TT', '99',
  // 同色大牌
  'AKs', 'AQs', 'AJs', 'ATs',
  'KQs', 'KJs',
  'QJs',
  // 不同色大牌
  'AKo', 'AQo'
];

// HJ位置 Open范围 (~20-25%)
const HJ_OPEN_HANDS = [
  ...UTG_OPEN_HANDS,
  '88', '77',
  'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KTs', 'K9s',
  'QTs', 'Q9s',
  'JTs', 'J9s',
  'T9s',
  'AJo', 'ATo',
  'KQo'
];

// CO位置 Open范围 (~25-30%)
const CO_OPEN_HANDS = [
  ...HJ_OPEN_HANDS,
  '66', '55',
  'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
  'Q8s',
  'J8s',
  'T8s',
  '98s', '87s',
  'A9o', 'A8o',
  'KJo', 'KTo'
];

// BTN位置 Open范围 (~40-50%)
const BTN_OPEN_HANDS = [
  ...CO_OPEN_HANDS,
  '44', '33', '22',
  'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
  'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
  'T7s', 'T6s',
  '97s', '96s',
  '86s', '85s',
  '76s', '75s', '65s',
  'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
  'K9o', 'K8o',
  'QJo', 'QTo', 'Q9o',
  'JTo', 'J9o',
  'T9o', 'T8o',
  '98o'
];

// SB位置 Open范围 (~35-45%)
const SB_OPEN_HANDS = [
  ...BTN_OPEN_HANDS
];

// BB位置 防守范围（vs BTN open，~30-40%）
const BB_DEFEND_HANDS = [
  'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
  'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s',
  'QJs', 'QTs', 'Q9s', 'Q8s',
  'JTs', 'J9s', 'J8s',
  'T9s', 'T8s', 'T7s',
  '98s', '97s',
  '87s', '86s',
  '76s', '75s', '65s',
  'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
  'KQo', 'KJo', 'KTo',
  'QJo', 'QTo',
  'JTo'
];

// 3-Bet范围（vs HJ open from CO位置，~8-12%）
const CO_3BET_VS_HJ_HANDS = [
  'AA', 'KK', 'QQ', 'JJ', 'TT',
  'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s',
  'KQs', 'KJs',
  'QJs',
  'AKo', 'AQo'
];

// Call 3-Bet范围（BTN vs CO 3bet，~15-20%）
const BTN_CALL_3BET_HANDS = [
  'QQ', 'JJ', 'TT', '99', '88', '77',
  'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KQs', 'KJs', 'KTs',
  'QJs', 'QTs',
  'JTs', 'J9s',
  'T9s', 'T8s',
  '98s', '87s', '76s',
  'AQo', 'AJo', 'ATo',
  'KQo'
];

// 4-Bet范围（vs 3bet，~4-6%）
const FOURBET_HANDS = [
  'AA', 'KK', 'QQ',
  'AKs', 'AKo'
];

// Call 4-Bet范围（~2-3%）
const CALL_4BET_HANDS = [
  'AA', 'KK', 'QQ',
  'AKs'
];

// Flop Check范围（示例：作为preflop caller在不利位置）
const FLOP_CHECK_HANDS = [
  '99', '88', '77', '66', '55', '44', '33', '22',
  'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KJs', 'KTs', 'K9s',
  'QJs', 'QTs', 'Q9s',
  'JTs', 'J9s',
  'T9s', 'T8s',
  '98s', '87s', '76s', '65s',
  'AJo', 'ATo', 'A9o',
  'KJo', 'KTo',
  'QJo', 'QTo',
  'JTo'
];

// Flop Bet范围（示例：作为preflop aggressor持续下注）
const FLOP_BET_HANDS = [
  'AA', 'KK', 'QQ', 'JJ', 'TT',
  'AKs', 'AQs', 'AJs', 'ATs',
  'KQs', 'KJs', 'KTs',
  'QJs', 'QTs',
  'JTs',
  'AKo', 'AQo', 'AJo',
  'KQo'
];

/**
 * 创建预设范围
 */
export function createPresetRanges(): Range[] {
  const now = Date.now();
  
  return [
    // Open范围
    {
      id: 'preset-utg-open',
      name: 'UTG Open (15-20%)',
      hands: new Set(UTG_OPEN_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-hj-open',
      name: 'HJ Open (20-25%)',
      hands: new Set(HJ_OPEN_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-co-open',
      name: 'CO Open (25-30%)',
      hands: new Set(CO_OPEN_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-btn-open',
      name: 'BTN Open (40-50%)',
      hands: new Set(BTN_OPEN_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-sb-open',
      name: 'SB Open (35-45%)',
      hands: new Set(SB_OPEN_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-bb-defend',
      name: 'BB vs BTN Open (30-40%)',
      hands: new Set(BB_DEFEND_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    // 3-Bet范围
    {
      id: 'preset-co-3bet',
      name: 'CO 3-Bet vs HJ (8-12%)',
      hands: new Set(CO_3BET_VS_HJ_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    // Call 3-Bet范围
    {
      id: 'preset-btn-call-3bet',
      name: 'BTN Call 3-Bet (15-20%)',
      hands: new Set(BTN_CALL_3BET_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    // 4-Bet范围
    {
      id: 'preset-4bet',
      name: '4-Bet 范围 (4-6%)',
      hands: new Set(FOURBET_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    // Call 4-Bet范围
    {
      id: 'preset-call-4bet',
      name: 'Call 4-Bet (2-3%)',
      hands: new Set(CALL_4BET_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    // Flop范围
    {
      id: 'preset-flop-check',
      name: 'Flop Check Range',
      hands: new Set(FLOP_CHECK_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'preset-flop-bet',
      name: 'Flop C-Bet Range',
      hands: new Set(FLOP_BET_HANDS),
      isPreset: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    }
  ];
}

