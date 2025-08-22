# ADR-003: Bidirectional Sync Protocol Design

## Status
Accepted

## Context

With dual configuration files (CLAUDE.md and AGENTS.md) and distributed memory systems, we need a robust synchronization protocol that:
- Detects changes across platforms
- Resolves conflicts intelligently
- Maintains data integrity
- Provides rollback capability
- Works with both manual and automated updates

## Decision

Implement a multi-level sync protocol with:

1. **Change Detection**: Content hashing with MD5 checksums
2. **Conflict Resolution**: Platform-specific preferences with manual override
3. **Atomic Operations**: Transactional updates with rollback
4. **State Management**: Persistent sync metadata with history

### Sync Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLAUDE.md │────▶│ Sync Engine │◀────│  AGENTS.md  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Sync State   │
                    │ (.chatgpt/   │
                    │  sync/)      │
                    └──────────────┘
```

### Conflict Resolution Matrix

| Conflict Type | Claude Changes | OpenAI Changes | Resolution |
|--------------|---------------|----------------|------------|
| Content | Yes | No | Claude → OpenAI |
| Content | No | Yes | OpenAI → Claude |
| Content | Yes | Yes | Manual prompt |
| Structure | Any | Any | Claude wins |
| Memory | Yes | Yes | Three-way merge |

## Consequences

### Positive
- Automated synchronization reduces manual work
- Conflict detection prevents data loss
- Platform preferences respect tool strengths
- History tracking enables debugging
- Rollback provides safety net

### Negative
- Sync complexity increases maintenance
- Conflicts require manual intervention
- State files add storage overhead
- Performance impact during sync

### Neutral
- New CLI commands needed
- Documentation for sync workflow
- Testing across platforms required
- User training on conflict resolution

## Implementation

### Sync Metadata Structure
```json
{
  "version": "1.0.0",
  "lastSync": "2025-01-22T10:00:00Z",
  "checksums": {
    "claude": "md5hash1",
    "agents": "md5hash2",
    ".claude/memory/project.md": "md5hash3"
  },
  "conflicts": [],
  "history": [
    {
      "timestamp": "2025-01-22T10:00:00Z",
      "changes": { "claude": 5, "openai": 3 },
      "conflicts": 1
    }
  ]
}
```

### Sync Workflow
1. **Check State**: Compare current checksums with stored
2. **Detect Changes**: Identify modified files
3. **Analyze Conflicts**: Determine resolution strategy
4. **Apply Changes**: Execute sync operations
5. **Update Metadata**: Record new state
6. **Verify Integrity**: Validate sync success

### Performance Targets
- Sync completion: <60 seconds
- Conflict detection: <5 seconds
- Auto-resolution rate: >85%
- State file size: <100KB

## Alternatives Considered

1. **Git-based Sync**: Too complex for non-developers
2. **Cloud Sync Service**: Privacy and dependency concerns
3. **Manual Sync Only**: Error-prone and time-consuming
4. **One-way Sync**: Loses bidirectional benefits
5. **Real-time Sync**: Too resource-intensive

## Risk Mitigation

### Data Loss Prevention
- Pre-sync backups
- Atomic operations
- Rollback capability
- Conflict preservation

### Conflict Minimization
- Clear platform boundaries
- Sync frequency recommendations
- Conflict prevention guidelines
- Team communication protocols

## Monitoring

Track sync health via:
- Success/failure rates
- Conflict frequency
- Resolution patterns
- Performance metrics
- User feedback

## References

- Distributed Systems Synchronization Patterns
- Conflict-free Replicated Data Types (CRDTs)
- Three-way Merge Algorithms
- File Synchronization Best Practices