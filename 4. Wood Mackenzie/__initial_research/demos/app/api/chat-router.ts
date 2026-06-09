import { z } from "zod";
import { createRouter, publicQuery, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { chatConversations, chatMessages } from "../db/schema";
import { eq, desc } from "drizzle-orm";

// Simulated AI responses for the demo
const AI_RESPONSES: Record<string, string> = {
  default: `Based on the latest data, I can provide several key insights:

**Supply-Demand Balance**: The copper market remains in a structural deficit of approximately 900kt for 2026, driven by declining ore grades in Chile and limited new project approvals.

**Price Outlook**: Current LME copper at $9,875/t represents fair value relative to the cost curve. The 90th percentile AISC of $2.30/lb suggests strong producer margins at current prices.

**Key Risks**: 
- Chilean water restrictions (Escondida, Collahuasi)
- Panamanian Cobre Panama closure (-350kt)
- Permitting delays in US and Canada

**Investment Implications**: Senior producers with low-cost assets (BHP, Glencore) are best positioned. Development-stage projects in tier-1 jurisdictions command premium valuations.

Would you like me to dive deeper into any specific aspect, such as the cost curve breakdown, regional supply risks, or comparative asset analysis?`,

  cost: `Here's the global copper cost curve analysis:

**Cost Curve Positioning (2026)**:
- **10th percentile**: $0.75/lb (Grasberg - by-product credits)
- **25th percentile**: $1.20/lb (Escondida, Kamoto)
- **Median (50th)**: $1.72/lb (Antamina)
- **75th percentile**: $2.05/lb (El Teniente)
- **90th percentile**: $2.30/lb (Los Bronces)

**Margin Analysis at $4.48/lb ($9,875/t)**:
- All operating assets generating positive cash margins
- Average margin: $2.76/lb above median AISC
- Most vulnerable: Los Bronces, Morenci at higher cost end

**Trend**: Costs rising 5-8% YoY due to energy, labor, and reagent inflation. Diesel-to-electrification transition at Escondida and Chuquicamata could shift cost curve meaningfully by 2028-2030.

Shall I generate a detailed cost curve chart or compare specific assets?`,

  lithium: `The lithium market is at an inflection point:

**Price Action**: Carbonate prices at $14,250/t are down 50% from 2022 peaks but have stabilized. Spodumene concentrate at $1,100/t is at cash costs for marginal Australian producers.

**Supply Response**: 
- Greenbushes and Pilgangoora maintaining output
- Wodgina reducing to 50% capacity
- African hard rock projects (AVZ, Manono) delayed on financing

**Demand Trajectory**: 
- EV sales tracking 35% YoY growth
- Battery capacity additions of 2.5TWh in 2026
- Stationary storage emerging as demand driver

**2026-2028 Outlook**: Market moving from deficit to balanced. New supply from Chilean brine expansions (Salar de Atacama +40%) and African hard rock should match demand growth. Price floor supported by hard rock production costs at $8,000-10,000/t LCE.

Key question: Will downstream battery makers lock in long-term contracts at current prices?`,

  gold: `Gold market analysis at $2,346/oz:

**Supply Side**: 
- Global mine production ~4,900t (flat YoY)
- Grade decline continuing (-3% annually)
- Reserve replacement ratios below 100% for majors
- Discovery pipeline weakest in 30 years

**Demand Composition**:
- Central banks: 1,050t (22% of demand) - record buying continues
- Investment/ETFs: 920t (tracking inflows)
- Jewelry: 2,200t (India/China recovery)
- Technology: 320t

**Macro Drivers**:
- Real yields declining supports opportunity cost argument
- USD weakness expected in H2
- Geopolitical premium persistent (Middle East, Ukraine)
- Debt sustainability concerns in US/EU

**Valuation**: At $2,346/oz, approximately 40% of the cost curve generates strong free cash flow. Key outperformers: Barrick (Nevada), Newmont (Tanami), Agnico (Detour Lake).

The combination of structural supply constraints and diversified demand makes gold a compelling portfolio allocation in the current macro environment.`,

  esg: `ESG factors are increasingly driving capital allocation in mining:

**Carbon Intensity Rankings** (tCO2e/t metal):
1. **Best**: Sudbury Nickel (2.5) - hydro power
2. **Good**: Salar de Atacama Lithium (1.5) - solar evaporation
3. **Average**: Australian iron ore (1.2-2.8)
4. **Poor**: Chinese aluminium (12.0) - coal power
5. **Worst**: Indonesian nickel (8.5) - HPAL + coal

**Water Stress**: Chilean copper operations face severe water restrictions. Escondida's desalination expansion ($3.2B) is critical. Grade decline means more tonnes processed per unit of metal, increasing water intensity.

**Social License**: 
- DRC cobalt: ongoing artisanal mining concerns
- Peru: community blockades affecting 5% of copper supply
- PNG: Porgera restart negotiations continue

**Capital Flow Impact**: ESG-focused funds now represent $35T AUM. Carbon-adjusted cost curves show premium for low-cintensity assets. EU CBAM will add $150-200/t to imported aluminium by 2026.

Companies with strong ESG scores (Agnico, Rio Tinto, BHP) trade at 15-25% valuation premium. This is structural, not cyclical.`,

  report: `I'll generate a comprehensive research report for you. Here's the structure:

**Executive Summary**: The global copper market faces a widening structural deficit through 2028, driven by grade decline, water stress, and permitting delays. Current prices at $9,875/t provide strong margins for low-cost producers but pressure higher-cost operations.

**Key Findings**:
1. Supply deficit of 900kt in 2026, widening to 1.2Mt by 2028
2. Chilean production at risk from water restrictions (-5-8%)
3. African copperbelt (Kamoto, Kansanshi) critical for supply growth
4. Energy transition demand adds 2.5Mt by 2030

**Cost Curve Analysis**: Median AISC of $1.72/lb with top-quartile assets generating $2.50+ margins. Grasberg, Escondida, and Kamoto are the lowest-cost producers.

**Investment Recommendations**:
- **Buy**: BHP, Glencore, Ivanhoe Mines (low cost, growth)
- **Hold**: Freeport, Southern Copper (fair value)
- **Avoid**: High-cost developers in water-stressed regions

**Risks**: Chinese demand slowdown, substitution, new technology (hydrogen in steel)

**Appendices**: Detailed cost curve data, asset-level production forecasts, sensitivity analysis

Would you like me to export this as a PDF or dive deeper into any specific section?`,
};

function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("cost") || msg.includes("curve") || msg.includes("aisc") || msg.includes("c1")) {
    return AI_RESPONSES.cost;
  }
  if (msg.includes("lithium") || msg.includes("battery") || msg.includes("ev")) {
    return AI_RESPONSES.lithium;
  }
  if (msg.includes("gold") || msg.includes("precious")) {
    return AI_RESPONSES.gold;
  }
  if (msg.includes("esg") || msg.includes("carbon") || msg.includes("water") || msg.includes("environment")) {
    return AI_RESPONSES.esg;
  }
  if (msg.includes("report") || msg.includes("research") || msg.includes("generate")) {
    return AI_RESPONSES.report;
  }
  if (msg.includes("copper") || msg.includes("supply") || msg.includes("demand") || msg.includes("price")) {
    return AI_RESPONSES.default;
  }
  
  return AI_RESPONSES.default;
}

export const chatRouter = createRouter({
  conversation: createRouter({
    list: publicQuery.query(async () => {
      const db = getDb();
      return db.select().from(chatConversations).orderBy(desc(chatConversations.updatedAt)).limit(20);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        const conv = await db.select().from(chatConversations).where(eq(chatConversations.id, input.id));
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, input.id))
          .orderBy(chatMessages.createdAt);
        return {
          conversation: conv[0] || null,
          messages,
        };
      }),

    create: publicQuery
      .input(z.object({ title: z.string(), userId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const result = await db.insert(chatConversations).values({
          title: input.title,
          userId: input.userId || null,
        });
        return { id: Number(result[0].insertId) };
      }),
  }),

  message: createRouter({
    send: publicQuery
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        
        // Save user message
        await db.insert(chatMessages).values({
          conversationId: input.conversationId,
          role: "user",
          content: input.content,
        });

        // Generate AI response
        const aiContent = generateAIResponse(input.content);
        
        // Save AI message
        await db.insert(chatMessages).values({
          conversationId: input.conversationId,
          role: "assistant",
          content: aiContent,
        });

        // Update conversation timestamp
        await db.update(chatConversations)
          .set({ updatedAt: new Date() })
          .where(eq(chatConversations.id, input.conversationId));

        return { content: aiContent };
      }),

    list: publicQuery
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        return db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, input.conversationId))
          .orderBy(chatMessages.createdAt);
      }),
  }),
});
