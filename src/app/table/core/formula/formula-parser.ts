import { TableConfigs } from '../table.models';

const getRange = (formula: string) => {
  formula.substring(
    formula.indexOf('['),
    formula.indexOf(']'),
  );
}

export class FormulaParser {

  public readonly symbolMap: { [p: string]: string };
  public readonly descriptorMap: { [p: string]: string };

  public readonly formulas: string[];
  public readonly statics: string[];

  private formulasAndReplacers: any[];

  // TODO: formulas should have priority so we know what will have higher order than other
  // TODO: formulas should have static formula so any static formula will have higher priority than other
  constructor (private _configs: TableConfigs) {
    this.symbolMap = this.descriptorToSymbol(_configs.columns);
    this.descriptorMap = this.flip(this.symbolMap);
    this.formulasAndReplacers = this.replacePropWithSymbols(_configs.formulas.all, this.symbolMap);
    this.formulas = this.formulasAndReplacers.map(r => r.formula);
  }

  getFormulaForColumn(column: number) {
    return this.formulas.find(formula => {
      return formula.includes('x' + column);
    });
  }

  getReplacersForFormula(formula: string) {
    return this.formulasAndReplacers.find(item => item.formula === formula).replacers;
  }

  private replacePropWithSymbols (formulas: { expression: string }[], symbolMap) {
    return formulas.map(formula => {
      let newFormula = formula.expression;
      const replacers = [];
      Object.entries(symbolMap).forEach(([prop, symbol]: [string, string]) => {
        const forReplace = newFormula.replace(prop, symbol);
        if (forReplace !== newFormula) {
          replacers.push(prop);
        }
        newFormula = forReplace;
      });
      return {
        formula: newFormula,
        replacers,
      };
    });
  }

  private flip (object) {
    const result = {};
    Object.entries(object).forEach(([key, value]: [string, string]) => {
      result[value] = key;
    });
    return result;
  }

  private descriptorToSymbol (descriptors: any[]) {
    return descriptors.reduce((prev, current, index) => {
      prev[current.prop] = 'x' + index;
      return prev;
    }, {});
  }

}
