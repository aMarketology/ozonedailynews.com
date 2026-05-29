# OzoneNews | Extended Niche Topic Playbook
# Low competition. High intent. Underserved by major outlets.
# Updated: May 29, 2026

These beats are NOT in TOPICS.md. Each one is a specific niche where OzoneNews can
rank #1 or #2 within 90 days because no major outlet owns the keyword cluster yet.
Strategy: publish 3-5 articles per niche to establish topical authority, then expand.

---

## 1. LLM Inference Efficiency | The $0.001/Token Race

**The gap:** Benchmark sites cover accuracy. Nobody covers the cost curve for
production inference in plain language. DevOps engineers and startup CTOs are
actively searching for this data and finding nothing useful.

**Core keyword cluster:**
- `llm inference cost per token 2026`
- `groq vs together ai vs fireworks speed`
- `vllm vs tensorrt-llm benchmark`
- `kv cache optimization techniques`
- `quantization quality tradeoff llm`
- `batching strategies llm inference`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `llm-inference-cost-comparison-providers-2026` | Price per 1M tokens: OpenAI vs Anthropic vs Together vs Groq vs Fireworks — live updated table | Provider pricing pages, Artificial Analysis |
| `vllm-vs-tensorrt-llm-throughput-benchmark-2026` | Tokens/sec on identical hardware, real numbers from published evals | vLLM GitHub, NVIDIA TRT-LLM docs |
| `int4-vs-int8-quantization-quality-loss-llm` | Exactly how much accuracy you trade for 2x speed — per model | LM-Eval harness results |
| `speculative-decoding-llm-speed-gains-2026` | How much faster it actually makes production deployments | DeepMind, Leandro von Werra papers |
| `prefill-decode-disaggregation-mooncake-system` | The architectural split that cuts latency in half | Mooncake paper (Kimi team) |
| `flash-attention-3-vs-flash-attention-2-benchmarks` | Exact speedups on H100 vs A100 | Dao-AILab GitHub, NVIDIA benchmarks |

**Format rule:** Every article must include a comparison table with real numbers.
Sourced from reproducible benchmarks, not vendor marketing.

---

## 2. Atmospheric Methane Monitoring | The Invisible Climate Crisis

**The gap:** CO2 gets all the coverage. Methane is 80x more potent over 20 years and
its sources are poorly mapped. Satellite monitoring just got dramatically better
(MethaneSAT, TROPOMI, Carbon Mapper). Nobody is translating the raw satellite data
into readable journalism.

**Core keyword cluster:**
- `methane emissions satellite data 2026`
- `methane hotspots map 2026`
- `permafrost methane release arctic`
- `methane from landfills data`
- `oil gas methane leaks satellite`
- `methaneSAT results 2026`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `methane-satellite-monitoring-2026-explained` | How MethaneSAT, TROPOMI, and Carbon Mapper work and what they found | EDF MethaneSAT, ESA, Carbon Mapper portal |
| `permafrost-methane-feedback-loop-data-2026` | How much methane is being released, where, and what the models say | NSIDC, Nature Climate Change |
| `oil-gas-methane-leaks-basin-by-basin-data` | Which basins are worst, which companies are responsible | Carbon Mapper basin reports |
| `landfill-methane-emissions-us-state-data` | EPA landfill inventory vs satellite-detected anomalies | EPA GHGRP, Google/EDF satellite data |
| `arctic-lake-methane-ebullition-measurement` | New measurement studies on bubbling emissions | AGU Journals |
| `methane-vs-co2-global-warming-potential-explainer` | The GWP-20 vs GWP-100 debate with actual numbers | IPCC AR6 WG1 Chapter 7 |

**Publish strategy:** Lead with the explainer, then one data-driven followup per satellite
data release (MethaneSAT publishes new basin data monthly).

---

## 3. Wildfire Smoke and Air Quality Science

**The gap:** Every major outlet covers wildfires. Nobody covers the atmospheric chemistry
of the smoke at the level that people searching `pm2.5 health effects` or
`wildfire smoke ozone` actually need. AQI numbers without science context = missed
opportunity.

**Core keyword cluster:**
- `wildfire smoke pm2.5 health effects 2026`
- `wildfire smoke ozone formation`
- `air quality index explained 2026`
- `purple air vs epa sensor accuracy`
- `how long does wildfire smoke last`
- `indoor air quality wildfire`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `wildfire-smoke-chemistry-pm25-ozone-formation` | How smoke becomes secondary ozone days after the fire | ACS Environmental Science & Technology |
| `aqi-explained-what-pm25-numbers-actually-mean` | Each AQI band with dose-response data from epidemiology studies | EPA AQS, WHO Air Quality Guidelines |
| `purpleair-vs-epa-sensor-accuracy-comparison` | Exactly how far off consumer sensors are and the correction factor | South Coast AQMD data |
| `wildfire-smoke-indoor-air-quality-data` | Infiltration rates by building type, filter effectiveness data | LBNL Indoor Environment Group |
| `western-us-smoke-days-trend-2000-2026` | How many days per year are smoke-affected, county by county | EPA AirData, Stanford WFSL |
| `wildfire-ozone-depletion-stratospheric-smoke` | The understudied phenomenon: pyrocumulonimbus clouds injecting smoke into stratosphere | Nature, NOAA CSL |

**Ozone angle:** Wildfire pyrocumulonimbus events inject aerosols into the stratosphere.
This is OzoneNews's unique lane. The 2019-2020 Australian fires were a documented case.

---

## 4. Microplastics Science | What the Research Actually Shows

**The gap:** "Microplastics found in X" is now a reflexive headline. Nobody is contextualizing
the dose-response data or explaining what "found in X" actually means for health.
Researchers are frustrated by sensationalized coverage and will cooperate with accurate outlets.

**Core keyword cluster:**
- `microplastics health effects research 2026`
- `microplastics in human blood study`
- `nanoplastics blood brain barrier`
- `microplastics in food how much`
- `microplastics filter water`
- `microplastics atmosphere transport`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `microplastics-human-health-effects-what-research-shows` | What is proven vs speculative — honest dose-response breakdown | Nature Medicine, The Lancet |
| `nanoplastics-blood-brain-barrier-study-2026` | The 2024 Columbia study explained with the actual findings and limitations | PNAS, Columbia Mailman SPH |
| `microplastics-in-food-quantity-comparison` | How much plastic you actually ingest from different foods — ranked | EFSA, WHO report data |
| `atmospheric-microplastics-transport-distance` | How plastic travels via wind from urban centers to remote areas | Nature Geoscience |
| `microplastics-drinking-water-filter-effectiveness` | Which filter types remove what size particles — actual lab data | NSF International, AWWA |
| `microplastics-in-human-placenta-testis-lung` | What the tissue-level studies found without the sensationalism | NEJM, Nature Medicine |

**Differentiator:** Every article must clearly separate correlation from causation.
This builds trust with the science-literate audience that nobody else is writing for.

---

## 5. Battery Chemistry and Grid Storage | The Transition Bottleneck

**The gap:** EV battery coverage is dominated by Tesla stock news. The actual chemistry
advances — sodium-ion, solid-state, iron-air — are nearly uncovered outside academic press
releases. Grid storage, not EVs, may be the more important story in 2026.

**Core keyword cluster:**
- `sodium ion battery vs lithium ion 2026`
- `solid state battery timeline 2026`
- `iron air battery grid storage`
- `battery energy density comparison 2026`
- `grid scale battery storage cost 2026`
- `form energy iron air battery progress`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `sodium-ion-battery-vs-lithium-ion-comparison-2026` | Energy density, cycle life, cost per kWh — real numbers from CATL and BYD production lines | CATL announcements, Benchmark Mineral Intelligence |
| `solid-state-battery-actual-timeline-2026` | What Toyota, QuantumScape, and Solid Power have actually demonstrated vs. claimed | SEC filings, Nature Energy |
| `iron-air-battery-form-energy-grid-storage` | How it works, what Form Energy's deployed cost is, where it makes sense | Form Energy white papers, DOE data |
| `grid-scale-battery-storage-cost-curve-2026` | LCOS (levelized cost of storage) trends, how fast costs are falling | BloombergNEF, NREL Annual Storage Outlook |
| `battery-recycling-economics-lithium-recovery` | What percentage of lithium is actually recovered and at what cost | Redwood Materials, Ascend Elements data |
| `flow-battery-vs-lithium-ion-grid-storage` | Vanadium redox and zinc-bromine systems — when they beat Li-ion | PNNL, Pacific Northwest National Laboratory |

---

## 6. Noise Pollution and Acoustic Ecology | Overlooked Health Story

**The gap:** Completely uncovered in digital media. The WHO released updated noise
guidelines in 2018 with specific dB thresholds for cardiovascular risk. The EPA's
noise office was defunded in 1982 and never restored. This is a real regulatory and
health story with no outlet claiming it.

**Core keyword cluster:**
- `noise pollution health effects research`
- `traffic noise cardiovascular risk`
- `noise ordinance by city 2026`
- `decibel levels health damage`
- `noise canceling earbuds hearing protection`
- `ocean noise pollution marine mammals`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `noise-pollution-cardiovascular-risk-who-data` | WHO 2018 Environmental Noise Guidelines: what 55 dB Lnight actually does | WHO EURO, ANSES |
| `traffic-noise-sleep-disruption-dose-response` | Specific dB thresholds where sleep fragmentation begins, per WHO | EURONOISE studies |
| `ocean-noise-pollution-shipping-sonar-marine-mammals` | How anthropogenic noise affects cetacean navigation and communication | NOAA, Ocean Conservation Research |
| `epa-noise-office-defunded-1982-what-happened` | The regulatory vacuum and what states have done to fill it | EPA history, INCE |
| `quietest-cities-loudest-cities-noise-data` | WHO European noise mapping data explained | EEA Noise in Europe report |
| `decibel-levels-explained-health-thresholds` | The physics and biology: exactly what 65 dB, 85 dB, and 120 dB do | CDC, NIOSH, WHO |

---

## 7. Insect Decline and Arthropod Biomass | The Understudied Collapse

**The gap:** "Insect apocalypse" gets occasional features in NYT and The Guardian.
The actual data — study by study, taxon by taxon, region by region — is not being
reported anywhere accessibly. Entomologists desperately want accurate coverage.

**Core keyword cluster:**
- `insect decline 2026 data`
- `insect biomass loss statistics`
- `monarch butterfly population 2026`
- `firefly decline causes`
- `pollinator decline research`
- `arthropod abundance long term data`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `insect-biomass-decline-data-by-region-2026` | What the long-term monitoring studies show region by region — not just the 27% headline | Hallmann et al., van Klink et al., Entomological Society |
| `monarch-butterfly-population-2026-count` | The overwintering count data, what it means, what is driving it | WWF Mexico, Xerces Society |
| `light-pollution-insect-decline-research` | The mechanism: how artificial night light disrupts insect reproduction | Nature Communications, Firefly Watch |
| `pesticide-insect-decline-neonicotinoid-data` | What the field studies show vs. the lab studies — the contested science | EFSA, IPBES assessment |
| `pollinator-decline-crop-yield-economic-cost` | Specific dollar figures on what losing pollinators costs agriculture | USDA, Cornell Lab data |
| `freshwater-insect-decline-vs-terrestrial` | Why aquatic insects are declining faster and why it matters for food webs | Science (2019 van Klink meta-analysis follow-ons) |

---

## 8. Light Pollution and Dark Sky Science

**The gap:** The International Dark-Sky Association has designation data on 200+ protected
areas. The Fabio Falchi sky brightness atlas is widely cited but never explained.
Almost no outlet covers the ecological consequences (insects, birds, sea turtles)
with real data. This is an entirely unclaimed content niche.

**Core keyword cluster:**
- `light pollution map 2026`
- `light pollution health effects`
- `dark sky parks list 2026`
- `light pollution and bird migration`
- `bortle scale explained`
- `light pollution and sea turtles`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `light-pollution-map-us-2026-explained` | How the Falchi atlas works, what the colors mean, how to read it | Light Pollution Atlas (Falchi 2016 + updates) |
| `bortle-scale-explained-dark-sky-measurement` | What Bortle 1 through 9 actually means in naked-eye terms | IDA, Sky and Telescope |
| `light-pollution-bird-migration-disruption-data` | Chicago Bird Collision Monitors data and the specific building-kill mechanism | Cornell Lab, Fatal Light Awareness Program |
| `light-pollution-sea-turtle-nesting-research` | Florida data: how artificial light causes hatchling disorientation | NOAA Fisheries, Sea Turtle Conservancy |
| `dark-sky-reserve-designation-process-explained` | How a community gets IDA Dark Sky Community status — specific steps | IDA certification docs |
| `sky-brightness-trends-2011-2023-citizen-science` | Globe at Night data: how fast the night sky is brightening globally | Science (Kyba et al. 2023) |

---

## 9. Urban Heat Island Effect | Data-Driven City Coverage

**The gap:** Every outlet mentioned UHI during the 2023 heat wave. Nobody covered the
actual measurement data, the interventions that work (green roofs, cool pavements,
urban trees), or the mortality economics. This is a high-search, election-adjacent
topic (city planning, housing, climate) that can drive steady organic traffic.

**Core keyword cluster:**
- `urban heat island effect data by city`
- `urban heat island mitigation strategies`
- `cool roofs effectiveness data`
- `urban tree canopy temperature reduction`
- `heat mortality by city 2026`
- `urban heat island vs rural temperature difference`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `urban-heat-island-temperature-data-us-cities` | How much hotter major US cities are vs. surrounding rural areas — measured, not modeled | NOAA Urban Heat Island assessment, Climate Central |
| `cool-roofs-effectiveness-data-temperature-reduction` | Measured temperature reduction from white/cool roofs — per study | Lawrence Berkeley National Lab Heat Island Group |
| `urban-tree-canopy-cooling-effect-per-species` | Which tree species cool most effectively, cost per degree of cooling | US Forest Service i-Tree data |
| `heat-mortality-cost-by-city-2026` | How many deaths is each city's UHI causing, in dollar terms | CDC WONDER, Lancet Countdown |
| `urban-heat-island-low-income-neighborhood-disparity` | The environmental justice angle: impervious surface cover vs. income by census tract | EPA EJScreen, NOAA NLCD |
| `paris-cool-island-experiment-results` | Paris's massive urban cooling program — what it achieved | APUR, Nature Cities |

---

## 10. Seismology and Volcanic Activity | Real-Time Science Coverage

**The gap:** USGS publishes earthquake data in real time. Volcano Observatory Notices
for Aviation (VONAs) are public. The Smithsonian Global Volcanism Program updates
weekly. None of this data is being translated into searchable, timely articles.
This is a spike-driven traffic niche (every M5.5+ earthquake triggers searches).

**Core keyword cluster:**
- `earthquake news today 2026`
- `volcano eruption 2026`
- `usgs earthquake activity weekly`
- `yellowstone volcano latest update`
- `pacific ring of fire seismic activity`
- `earthquake early warning system california`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `usgs-earthquake-activity-report-weekly` | Weekly digest: M4.5+ global earthquakes, what they indicate | USGS Earthquake Hazards Program |
| `yellowstone-volcano-activity-2026-update` | What USGS Yellowstone Volcano Observatory actually says | YVO monthly updates |
| `earthquake-early-warning-shakeAlert-coverage` | ShakeAlert: which states have it, how many seconds of warning it gives, what to do | USGS ShakeAlert, PNSN |
| `ring-of-fire-seismic-activity-explained` | What makes it seismically active and the current elevated zones | USGS, IRIS FDSN data |
| `volcano-sulfur-dioxide-so2-ozone-connection` | How volcanic SO2 contributes to stratospheric aerosols and affects ozone — OzoneNews unique angle | GVP, NOAA TOMS/Aura data |
| `cascadia-subduction-zone-earthquake-probability-data` | The USGS Hazard Model numbers, what a M9 would look like, preparation data | USGS NSHM23 |

---

## 11. Soil Carbon and Regenerative Agriculture Data

**The gap:** Regenerative ag is marketing-heavy and data-light. There is real peer-reviewed
science on soil organic carbon sequestration rates, but it is buried in agronomy journals.
Farmers, investors, and policy people are all searching for this data and finding
nothing readable.

**Core keyword cluster:**
- `soil carbon sequestration data 2026`
- `regenerative agriculture carbon sequestration per acre`
- `no-till farming soil carbon research`
- `cover crop carbon data`
- `voluntary carbon market soil credits`
- `soil health indicators measurement`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `soil-carbon-sequestration-rates-by-practice-data` | Peer-reviewed numbers: how many tonnes CO2e per hectare per year for no-till, cover crops, compost | Poeplau & Don meta-analysis, IPCC AFOLU |
| `no-till-farming-soil-carbon-research-2026` | The conflicting evidence: some studies show no net benefit. What the meta-analyses show | Nature Food, Global Change Biology |
| `cover-crop-species-carbon-sequestration-comparison` | Which species sequester the most carbon and how they affect next-year yield | SARE, Rodale Institute |
| `voluntary-carbon-market-soil-credits-accuracy` | How soil carbon credits are measured and why many are being invalidated | Berkeley Carbon Trading Project, CarbonPlan |
| `mycorrhizal-networks-soil-carbon-storage` | The emerging science on fungal networks and their role in deep carbon storage | Nature (Averill et al.) |
| `soil-health-score-card-indicators-usda` | What USDA's Soil Health Institute measures and what scores mean | USDA NRCS, Soil Health Institute |

---

## 12. Ocean Deoxygenation and Dead Zones

**The gap:** Ocean acidification gets all the coverage. Ocean deoxygenation (hypoxia) is
expanding faster. The Gulf of Mexico dead zone is measured every summer. Baltic,
Black Sea, Chesapeake Bay data is public. This is the most underreported ocean story.

**Core keyword cluster:**
- `ocean deoxygenation data 2026`
- `gulf of mexico dead zone size 2026`
- `ocean hypoxia causes`
- `chesapeake bay dead zone 2026`
- `oxygen minimum zones expanding`
- `dead zones ocean list`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `gulf-of-mexico-dead-zone-size-2026-forecast` | LUMCON annual forecast, why it varies, what drives it | LUMCON, USGS nutrient loading data |
| `oxygen-minimum-zones-expanding-global-data` | How much OMZs have expanded since 1960 and what that means for fisheries | Science (Schmidtko et al. data) |
| `chesapeake-bay-hypoxia-monitoring-data-2026` | The Chesapeake Bay Program's summer monitoring — actual dissolved oxygen measurements | Chesapeake Bay Program |
| `ocean-deoxygenation-vs-acidification-comparison` | Why hypoxia may be faster-acting than pH changes for marine life | IUCN Ocean Deoxygenation report |
| `nitrogen-runoff-dead-zones-connection-us-farms` | The fertilizer-to-hypoxia pipeline with county-level data | USGS NAWQA, EPA |
| `deep-ocean-oxygen-trends-argo-float-data` | What the Argo float network is showing about oxygen at depth | IFREMER, Argo data portal |

---

## 13. Quantum Computing Milestones | Science Not Hype

**The gap:** Quantum computing coverage falls into two buckets: breathless "quantum
supremacy" press releases and dismissive "it will never work" skepticism.
Neither is useful. There is a real science beat here for readers who want
"what does this actually mean" coverage.

**Core keyword cluster:**
- `quantum computing progress 2026`
- `quantum error correction milestone`
- `google willow quantum chip`
- `ibm quantum roadmap 2026`
- `quantum advantage timeline`
- `qubit coherence time record 2026`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `google-willow-chip-quantum-error-correction-explained` | What the "below threshold" error correction result actually means — without the hype | Nature (Google Quantum AI, 2024) |
| `ibm-quantum-roadmap-2026-progress` | IBM's Flamingo/Kookaburra milestones: what was hit, what slipped | IBM Research blog, Nature |
| `quantum-error-correction-explained-surface-code` | The surface code threshold: what it is and why Google's result matters | Caltech, Nielsen & Chuang accessible explainer |
| `qubit-types-comparison-superconducting-trapped-ion-photonic` | The tradeoffs: coherence time vs. gate fidelity vs. scalability | PRX Quantum review |
| `quantum-computing-cryptography-threat-timeline` | When will quantum computers actually break RSA? The honest NIST estimate | NIST PQC documentation |
| `neutral-atom-quantum-computing-atom-computing-2026` | The dark horse approach: why neutral atoms may leapfrog superconducting qubits | QuEra, Atom Computing, Harvard Lukin lab |

---

## 14. Psychedelic Science and Neuroplasticity Research

**The gap:** Psychedelic coverage is dominated by culture and lifestyle outlets.
The actual clinical trial data — FDA phase 2/3 outcomes, neuroimaging results,
mechanism papers — is almost never covered accessibly. This audience is huge
and underserved.

**Core keyword cluster:**
- `psilocybin clinical trial results 2026`
- `mdma ptsd treatment fda status 2026`
- `psychedelic therapy research 2026`
- `neuroplasticity psychedelics mechanism`
- `ketamine depression treatment data`
- `ibogaine opioid addiction research`

**Article queue:**

| Slug | Angle | Primary data source |
|---|---|---|
| `psilocybin-fda-approval-status-2026` | Where Phase 3 trials stand, what FDA's complete response letter said about COMPASS | FDA, COMPASS Pathways SEC filings |
| `mdma-ptsd-phase-3-trial-results-analysis` | Why the MAPS trial got rejected, what the data actually showed | NEJM, FDA AdCom meeting transcripts |
| `ketamine-vs-esketamine-depression-data` | The REMS program, real-world effectiveness vs. trial data | NEJM, JAMA Psychiatry |
| `psilocybin-neuroplasticity-mechanism-research` | How psilocybin promotes synaptogenesis — the Davis/Bhatt papers | Cell, Nature Neuroscience |
| `ibogaine-opioid-addiction-stanford-trial-results` | The Stanford VAMC study: what it found and what it means | Nature Medicine (2023 Cherian et al.) |
| `psychedelic-science-state-legalization-data-2026` | Colorado, Oregon: what pilot programs have measured so far | OHSU data, Healing Advocacy Fund |

---

## 15. Longevity Science | Data-Only Coverage

**The gap:** Longevity content is dominated by supplement influencers and David Sinclair.
The actual peer-reviewed science — what has been shown in humans, not just worms or mice —
is almost never explained clearly. The audience is enormous and desperate for
accurate, unsponsored information.

**Core keyword cluster:**
- `longevity research 2026 human studies`
- `rapamycin longevity human data`
- `nad+ supplement evidence 2026`
- `caloric restriction mimetics research`
- `senolytic drugs human trials 2026`
- `aging clock biomarker 2026`

**Article queue:**

| Slug | Angle | NC | Primary data source |
|---|---|---|---|
| `rapamycin-longevity-human-evidence-2026` | What the human data shows vs. the mouse data — the TRIAD and PEARL trials | NEJM Evidence, Aging Cell |
| `nad-supplement-human-trial-evidence-review` | NMN vs. NR vs. niacin: what actually raises NAD+ in human blood | Cell Metabolism (Yoshino et al.) |
| `senolytic-drugs-human-clinical-trials-2026` | Dasatinib + quercetin: what the Mayo Clinic trials show | EBioMedicine, Nature Aging |
| `aging-clocks-epigenetic-biomarker-accuracy` | DunedinPACE, PhenoAge, GrimAge: what they measure and their predictive accuracy | Nature Aging, Genomics papers |
| `caloric-restriction-human-calerie-trial-results` | The CALERIE trial: what 25% CR did to humans over 2 years | Science, JAMA Internal Medicine |
| `metformin-aging-tame-trial-progress-2026` | TAME trial interim data: is metformin actually doing anything in non-diabetics | Aging Cell, Albert Einstein College of Medicine |

---

## Cross-Niche Article Formats That Win

### The "What the Research Actually Shows" Format
Use this when a topic has been sensationalized. Structure:
1. The claim in circulation
2. What the studies actually measured
3. Effect sizes in plain numbers
4. What is not yet known
5. Who to follow for updates

### The Data Table Article
Lead with the table. Every row must be sourced. Example: "Sodium-ion vs Lithium-ion vs LFP — 8 metrics compared." These pages rank for years.

### The "False Consensus" Article
Find a topic where public belief diverges from scientific consensus.
Example: "Does no-till actually sequester carbon? The meta-analyses disagree."
These drive shares from researchers who are frustrated by the prevailing narrative.

### The Primary Source Translation
Take a paper in Nature or Science published within 7 days. Read the methods and
results sections — not the abstract. Write the article only the researchers
themselves would recognize as accurate. Link directly to the DOI.

---

## Monthly Calendar Integration

| Week | Niche | Trigger |
|---|---|---|
| Week 1 | Methane / Atmospheric | MethaneSAT monthly data drop |
| Week 1 | Seismology | USGS weekly earthquake digest |
| Week 2 | AI Inference | Artificial Analysis benchmark updates |
| Week 2 | Battery / Grid Storage | BloombergNEF monthly BNEF data |
| Week 3 | Ocean / Dead Zones | LUMCON seasonal forecast (Apr-Sep) |
| Week 3 | Wildfire / Air Quality | AirNow daily AQI spikes |
| Week 4 | Longevity / Psychedelic | New NEJM / Nature paper |
| Week 4 | Light / Noise Pollution | Any municipal policy announcement |
| Any day | Seismology | M5.5+ earthquake anywhere on Ring of Fire |
| Any day | Space Weather | X-class solar flare or geomagnetic storm |

---

## Author Assignment by Beat

| Beat | Assigned author | Slug |
|---|---|---|
| Atmospheric science, methane, wildfire | Simon Minter | `simon-minter` |
| AI, quantum, battery tech | Max DeLeonardis | `max-deleonardis` |
| Longevity, psychedelics, microplastics | OzoneNews Editorial Team | `ozonedailynews-editorial-team` |
| Seismology, ocean, insect decline | OzoneNews Editorial Team | `ozonedailynews-editorial-team` |
| Noise/light pollution, urban heat | OzoneNews Editorial Team | `ozonedailynews-editorial-team` |
| Soil carbon, regenerative ag | OzoneNews Editorial Team | `ozonedailynews-editorial-team` |
