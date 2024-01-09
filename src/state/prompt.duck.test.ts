import { generatePrompts } from './prompt.duck';
import { TrainingSettings } from './settings.duck';

const SETTINGS_BASE: TrainingSettings = {
  pieceType: 'corners',
  includeInverses: false,
  includeTwists: false,
  buffer: 'UFR',
  letterScheme: 'ADCBEHGFILKJMPONQTSRUXWV',
  selectedLetters: ['D'],
};


describe('generatePrompts', () => {
  it('should generate prompts without inverses or twists', () => {
    const settings = {
      ...SETTINGS_BASE,
    };
    const prompts = generatePrompts(settings);
    const expected = [
      'DA', 'DB', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DN', 'DO', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX'
    ];
    expect(prompts.sort()).toEqual(expected.sort());
  });

  it('should generate prompts without inverses but with twists', () => {
    const settings = {
      ...SETTINGS_BASE,
      includeTwists: true,
    };
    const prompts = generatePrompts(settings);
    const expected = [
      'DA', 'DB', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX'
    ];
    expect(prompts.sort()).toEqual(expected.sort());
  });

  it('should generate prompts with inverses but not twists', () => {
    const settings = {
      ...SETTINGS_BASE,
      includeInverses: true,
    };
    const prompts = generatePrompts(settings);
    const expected = [
      'DA', 'DB', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DN', 'DO', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX',
      'AD', 'BD', 'ED', 'FD', 'GD', 'HD', 'ID', 'JD', 'KD', 'ND', 'OD', 'RD', 'SD', 'TD', 'UD', 'VD', 'WD', 'XD'
    ];
    expect(prompts.sort()).toEqual(expected.sort());
  });

  it('should generate prompts without inverses or twists', () => {
    const settings = {
      ...SETTINGS_BASE,
      includeInverses: true,
      includeTwists: true,
    };
    const prompts = generatePrompts(settings);
    const expected = [
      'DA', 'DB', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX',
      'AD', 'BD', 'ED', 'FD', 'GD', 'HD', 'ID', 'JD', 'KD', 'ND', 'OD', 'PD', 'QD', 'RD', 'SD', 'TD', 'UD', 'VD', 'WD', 'XD'
    ];
    expect(prompts.sort()).toEqual(expected.sort());
  });
});