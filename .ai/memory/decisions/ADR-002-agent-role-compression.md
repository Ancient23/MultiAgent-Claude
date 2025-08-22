# ADR-002: Agent to Role Compression Strategy

## Status
Accepted

## Context

MultiAgent-Claude uses 50+ specialized agents with detailed templates averaging 3000-5000 characters each. ChatGPT custom instructions are limited to 1500 characters total. We need a systematic approach to compress agent behaviors into role instructions while preserving functionality.

## Decision

We will implement a multi-phase compression algorithm (COMPACT) that:

1. **Prioritizes Core Competencies**: Focus on essential expertise over examples
2. **Uses Systematic Compression**: Apply lexical, structural, and semantic optimizations
3. **Maintains Behavioral Patterns**: Preserve research-plan-execute workflow
4. **Creates Tiered Versions**: Standard (1500), Compact (1200), Minimal (800)

### Compression Phases

```javascript
// COMPACT Algorithm
Phase 1: Lexical (word-level)
Phase 2: Structural (format-level)  
Phase 3: Semantic (meaning-level)
Phase 4: Validation (quality check)
```

### Conversion Formula

```
Agent Template (3000+ chars)
    ↓ Extract core elements
Core Components (2000 chars)
    ↓ Apply COMPACT algorithm
Role Instruction (1500 chars)
    ↓ Validate functionality
Final Role (<1500 chars)
```

## Consequences

### Positive
- All agents can be used in ChatGPT
- Systematic approach ensures consistency
- Functionality preservation metrics
- Reusable compression patterns

### Negative
- Loss of detailed examples
- Reduced workflow granularity
- No MCP tool specifics
- Manual validation needed

### Neutral
- Creates new role file format
- Requires converter maintenance
- Documentation needs updates
- Testing across platforms needed

## Implementation

### Compression Priorities
1. **Keep**: Expertise, triggers, core approach
2. **Compress**: Workflow steps, quality standards
3. **Remove**: Examples, MCP references, metadata

### Character Budget
```
Act as statement: 200 chars
Activation triggers: 200 chars
Approach steps: 600 chars
Focus areas: 300 chars
Quality/Output: 200 chars
Total: 1500 chars
```

### Quality Metrics
- Expertise preservation: >90%
- Workflow adaptation: >85%
- Trigger effectiveness: >95%
- Character efficiency: >99%

## Alternatives Considered

1. **Multiple Instructions**: ChatGPT doesn't support well
2. **External References**: Can't reference files in instructions
3. **Minimal Roles**: Lose too much functionality
4. **No Compression**: Exceeds character limits

## Trade-offs

| Aspect | Agent Template | Role Instruction |
|--------|---------------|------------------|
| Size | 3000-5000 chars | <1500 chars |
| Detail | Comprehensive | Essential only |
| Tools | MCP-aware | Natural language |
| Examples | Multiple | None |
| Workflow | 10+ steps | 6 steps max |

## Validation

Each converted role must:
1. Activate on correct triggers
2. Follow similar workflow pattern
3. Maintain domain expertise
4. Produce comparable outputs
5. Stay under character limit

## References

- ChatGPT Custom Instructions Documentation
- Prompt Engineering Best Practices
- Text Compression Techniques
- Cross-Platform Behavior Translation Patterns