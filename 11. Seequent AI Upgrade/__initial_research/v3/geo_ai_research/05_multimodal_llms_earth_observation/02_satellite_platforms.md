# Satellite & Remote Sensing AI Platforms

## Commercial Platforms

### Farmonaut
- **Focus**: Satellite mineral detection for early-stage exploration
- **Accuracy**: ~92% for alteration signature identification
- **Cost savings**: Up to 85% reduction in early-stage exploration costs
- **Technology**: Satellite-driven subsurface prediction, rapid target generation
- **Use case**: Greenfield exploration screening, prioritization of ground follow-up

### LYRASENSE
- **Focus**: AI-powered GEOINT marketplace with agentic AI orchestration
- **Innovation**: Multi-provider satellite data integration with natural language interface
- **Edge deployment**: On-orbit processing capability
- **Technology**: Agentic AI, multispectral/SAR/thermal fusion, on-orbit processing
- **Use case**: Defense, intelligence, and critical mineral exploration

### BlackSky Spectra AI
- **Focus**: Real-time GEOINT with automated detection
- **Hardware**: Gen-3 satellites (35cm resolution), hourly revisit
- **Contract**: NGA Luno A contract
- **Technology**: AI object detection, automated alerts, persistent monitoring
- **Use case**: Infrastructure monitoring, anomaly detection, change detection

### ICEYE
- **Focus**: SAR satellite constellation for all-weather monitoring
- **Scale**: 60+ satellites, Gen4 at 16cm resolution
- **Contract**: EUR 1.7B German defense contract
- **Milestone**: Achieved profitability in 2025
- **Technology**: SAR imagery, all-weather monitoring, defense-grade analytics
- **Use case**: Ground deformation, infrastructure monitoring, disaster response

## Research and Open Source

### IBM / NASA Geospatial Foundation Model
- **Repository**: Hugging Face (open source)
- **Training data**: Harmonized Landsat Sentinel-2 (HLS)
- **Performance**: 15% better than state-of-the-art with half the labeled data
- **Commercial version**: IBM watsonx Environmental Intelligence Suite
- **Applications**: Flood mapping, burn scar detection, land use classification
- **Limitation**: Satellite-only, no subsurface integration

### Google Earth Engine
- **Platform**: Cloud-based geospatial analysis
- **AI integration**: Limited native AI, but supports custom ML workflows
- **Data catalog**: Petabyte-scale satellite imagery archive
- **Use case**: Large-scale environmental monitoring, deforestation tracking

### Microsoft Planetary Computer
- **Platform**: Cloud-based geospatial data and analysis
- **AI integration**: Supports PyTorch/TensorFlow workflows on satellite data
- **Data catalog**: Multi-petabyte environmental dataset collection
- **Use case**: Climate research, biodiversity monitoring, land use analysis

## Comparison Matrix

| Platform | Resolution | Revisit | Modalities | AI Level | Cost | Mining Focus |
|----------|-----------|---------|-----------|----------|------|-------------|
| Farmonaut | 10-30m | Days | Optical | Medium | Low | Yes |
| LYRASENSE | Variable | Hours | Multi | High | Medium | Emerging |
| BlackSky | 35cm | Hourly | Optical | High | High | No |
| ICEYE | 16cm (SAR) | Hours | SAR | Medium | High | No |
| IBM/NASA Geo FM | 30m | 16 days | Optical | Medium | Free (open) | No |
| Google Earth Engine | Variable | Variable | Multi | Low | Free (research) | No |
| Microsoft Planetary Computer | Variable | Variable | Multi | Low | Free (research) | No |

## Strategic Implications

**For exploration companies**: Satellite AI platforms enable rapid, low-cost screening of large areas before committing to expensive ground programs. The combination of optical alteration detection + SAR structural mapping + LLM geological reasoning represents a 10-100x cost reduction in early-stage exploration.

**For software vendors**: Integration of satellite AI with subsurface modeling (Leapfrog/Vulcan) is the missing link. Surface expression -> subsurface prediction workflows would transform exploration targeting.

**For regulators**: Satellite monitoring enables continuous environmental compliance monitoring, reducing the need for ground inspections.

## Future of Satellite AI in Mining

1. **Real-time targeting**: As new satellite data arrives, automatically flag anomalies for ground investigation
2. **Predictive monitoring**: Predict slope failures, tailings dam issues from deformation patterns
3. **Closure monitoring**: Long-term post-closure environmental monitoring from orbit
4. **Supply chain transparency**: Track mining activity globally for ESG compliance
5. **Automated permitting**: Satellite-based pre-assessment of environmental baseline conditions

## References

- Farmonaut: Satellite Mineral Detection Platform. 2025.
- LYRASENSE: AI-Powered GEOINT Marketplace. 2025.
- BlackSky Spectra AI: Real-Time GEOINT. 2025.
- ICEYE: SAR Constellation and Defense Contract. 2025.
- IBM / NASA: Geospatial Foundation Model. Hugging Face, 2023-2025.
