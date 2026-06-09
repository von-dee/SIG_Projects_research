import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { scenarios } from "../db/schema";
import { eq, desc } from "drizzle-orm";

function runSimulation(
  commodityPrice: number,
  demandGrowth: number,
  supplyConstraint: number,
  carbonTax: number,
  esgPremium: number,
  currencyRate: number
) {
  const years = [2026, 2027, 2028, 2029, 2030];
  const production: number[] = [];
  const costs: number[] = [];
  const margins: number[] = [];
  
  let baseProduction = 100;
  let baseCost = commodityPrice * 0.65;
  
  for (let i = 0; i < years.length; i++) {
    const yearMultiplier = 1 + (demandGrowth / 100) * i;
    const supplyReduction = 1 - (supplyConstraint / 100) * i * 0.5;
    const carbonCost = (carbonTax * i * 0.1) / currencyRate;
    const esgCost = (esgPremium / 100) * baseCost * i * 0.05;
    
    const prod = baseProduction * yearMultiplier * supplyReduction;
    const cost = baseCost + carbonCost + esgCost;
    const margin = ((commodityPrice - cost) / commodityPrice) * 100;
    
    production.push(Math.round(prod * 10) / 10);
    costs.push(Math.round(cost * 100) / 100);
    margins.push(Math.round(margin * 10) / 10);
  }
  
  const npv = margins.reduce((s, m) => s + m, 0) / margins.length;
  const irr = 8 + (demandGrowth * 0.5) - (supplyConstraint * 0.1) - (carbonTax * 0.02);
  
  return {
    years,
    production,
    costs,
    margins,
    npv: Math.round(npv * 100) / 100,
    irr: Math.round(irr * 100) / 100,
  };
}

function generateNarrative(params: {
  commodityPrice: number;
  demandGrowth: number;
  supplyConstraint: number;
  carbonTax: number;
  esgPremium: number;
  currencyRate: number;
  results: ReturnType<typeof runSimulation>;
}) {
  const { commodityPrice, demandGrowth, supplyConstraint, carbonTax, esgPremium, currencyRate, results } = params;
  
  let narrative = `## Scenario Analysis Summary\n\n`;
  
  narrative += `### Key Assumptions\n`;
  narrative += `- Commodity Price: $${commodityPrice.toLocaleString()}/unit\n`;
  narrative += `- Demand Growth: ${demandGrowth}% annually\n`;
  narrative += `- Supply Constraint: ${supplyConstraint}% impact\n`;
  narrative += `- Carbon Tax: $${carbonTax}/tCO2e\n`;
  narrative += `- ESG Premium: ${esgPremium}% on operating costs\n`;
  narrative += `- FX Rate: ${currencyRate}\n\n`;
  
  narrative += `### Results (2026-2030)\n`;
  narrative += `- **Production**: ${results.production[0]} → ${results.production[4]} units (${((results.production[4]/results.production[0]-1)*100).toFixed(1)}% change)\n`;
  narrative += `- **Operating Costs**: $${results.costs[0]} → $${results.costs[4]}/unit\n`;
  narrative += `- **Average Margin**: ${results.npv}%\n`;
  narrative += `- **Projected IRR**: ${results.irr}%\n\n`;
  
  if (demandGrowth > 5) {
    narrative += `### Demand Impact\n`;
    narrative += `Strong demand growth of ${demandGrowth}% annually creates a favorable demand environment. `;
    narrative += `This supports sustained pricing power and encourages investment in new capacity. `;
    narrative += `However, rapid demand growth may strain supply chains and increase input costs.\n\n`;
  }
  
  if (supplyConstraint > 10) {
    narrative += `### Supply Risk\n`;
    narrative += `The ${supplyConstraint}% supply constraint represents a significant supply-side risk. `;
    narrative += `This could result from permitting delays, resource nationalism, or technical challenges. `;
    narrative += `Tight supply conditions would amplify price upside but also increase operational risk.\n\n`;
  }
  
  if (carbonTax > 50) {
    narrative += `### Carbon Cost Impact\n`;
    narrative += `A carbon tax of $${carbonTax}/tCO2e adds material cost pressure, particularly for emissions-intensive operations. `;
    narrative += `Assets with high carbon intensity see cost increases of 8-15%, while low-cintensity operations gain competitive advantage. `;
    narrative += `This reinforces the strategic value of decarbonization investments.\n\n`;
  }
  
  if (esgPremium > 10) {
    narrative += `### ESG Premium Effect\n`;
    narrative += `The ${esgPremium}% ESG premium reflects increasing capital costs for operations with weaker ESG profiles. `;
    narrative += `This creates a two-tier market where best-in-class ESG assets command valuation premiums of 15-25%.\n\n`;
  }
  
  narrative += `### Strategic Implications\n`;
  if (results.irr > 12) {
    narrative += `The projected IRR of ${results.irr}% indicates strong project economics under these assumptions. `;
    narrative += `This scenario supports aggressive capital allocation and M&A activity.\n`;
  } else if (results.irr > 8) {
    narrative += `The projected IRR of ${results.irr}% suggests acceptable but not exceptional returns. `;
    narrative += `Selective investment focused on lowest-cost assets is recommended.\n`;
  } else {
    narrative += `The projected IRR of ${results.irr}% indicates challenging economics. `;
    narrative += `Capital discipline and cost reduction should be prioritized.\n`;
  }
  
  return narrative;
}

export const scenarioRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(scenarios).orderBy(desc(scenarios.updatedAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(scenarios).where(eq(scenarios.id, input.id));
      return result[0] || null;
    }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      commodityId: z.number(),
      commodityPrice: z.number(),
      demandGrowth: z.number(),
      supplyConstraint: z.number(),
      carbonTax: z.number(),
      esgPremium: z.number(),
      currencyRate: z.number(),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const results = runSimulation(
        input.commodityPrice,
        input.demandGrowth,
        input.supplyConstraint,
        input.carbonTax,
        input.esgPremium,
        input.currencyRate
      );
      
      const aiNarrative = generateNarrative({
        commodityPrice: input.commodityPrice,
        demandGrowth: input.demandGrowth,
        supplyConstraint: input.supplyConstraint,
        carbonTax: input.carbonTax,
        esgPremium: input.esgPremium,
        currencyRate: input.currencyRate,
        results,
      });
      
      const result = await db.insert(scenarios).values({
        ...input,
        description: input.description || null,
        userId: input.userId || null,
        results: JSON.stringify(results),
        aiNarrative,
      });
      
      return { id: Number(result[0].insertId), results, aiNarrative };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(scenarios).where(eq(scenarios.id, input.id));
      return { success: true };
    }),

  runSimulation: publicQuery
    .input(z.object({
      commodityPrice: z.number(),
      demandGrowth: z.number(),
      supplyConstraint: z.number(),
      carbonTax: z.number(),
      esgPremium: z.number(),
      currencyRate: z.number(),
    }))
    .mutation(async ({ input }) => {
      const results = runSimulation(
        input.commodityPrice,
        input.demandGrowth,
        input.supplyConstraint,
        input.carbonTax,
        input.esgPremium,
        input.currencyRate
      );
      
      const aiNarrative = generateNarrative({ ...input, results });
      
      return { results, aiNarrative };
    }),
});
