# Testing Documentation

This directory contains all testing scripts and documentation for the MessageAI app.

## 📁 Contents

### Backend API Tests

**`test-event-extraction.sh`**
- Tests the `/ai/extract-event` Lambda endpoint
- Validates 8 different date/time formats
- Checks extraction accuracy, conflict detection
- **Usage:** `./test-event-extraction.sh`
- **Prerequisites:** `jq` installed, Lambda deployed

### Manual Testing Guides

**`Phase2_Manual_Testing_Guide.md`**
- Comprehensive testing guide for Phase 2 features
- Step-by-step manual test procedures
- Expected results and acceptance criteria

**`FINAL_INTEGRATION_TESTING.md`**
- End-to-end integration testing guide
- Full system testing procedures
- Final verification before deployment

## 🚀 Quick Start

### Run Backend Tests

```bash
# Test event extraction endpoint
cd tests
./test-event-extraction.sh
```

### Manual Testing

1. Follow the guides in `Phase2_Manual_Testing_Guide.md`
2. Use the iOS simulator or physical device
3. Verify all acceptance criteria

## 📝 Adding New Tests

When creating new AI features, add corresponding test scripts here:

```bash
tests/
  ├── test-event-extraction.sh       # Task 2.1
  ├── test-decision-summary.sh       # Task 2.2 (coming soon)
  ├── test-priority-detection.sh     # Task 2.3 (coming soon)
  ├── test-rsvp-tracking.sh          # Task 2.4 (coming soon)
  └── test-deadline-extraction.sh    # Task 2.5 (coming soon)
```

## ✅ Test Status

| Feature | Backend Test | Manual Test | Status |
|---------|-------------|-------------|--------|
| Event Extraction | ✅ | ✅ | Complete |
| Decision Summary | ⏳ | ⏳ | Pending |
| Priority Detection | ⏳ | ⏳ | Pending |
| RSVP Tracking | ⏳ | ⏳ | Pending |
| Deadline Extraction | ⏳ | ⏳ | Pending |

## 🐛 Known Issues

See individual test files for known issues and workarounds.

---

**Last Updated:** October 25, 2025

