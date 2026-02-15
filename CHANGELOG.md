# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Base frontend folder structure (pages, components, services, types)

## [0.1.0] - 2026-02-05
### Added
- React + TypeScript frontend initialized using Vite
- Initial frontend project setup
- Basic project documentation (README)

## [0.2.0] - 2026-02-07
### Added
- Base layouts for customer and admin areas
- Shared UI components (buttons, modals)
- Client-side routing setup

## [0.3.0] - 2026-02-09
### Added
- Rooms list with search and active status filtering
- Booking cart flow with inline booking form
- Conflict checking hook for booking previews

## [0.4.0] - 2026-02-11
### Added
- Booking group submission API integration
- Customer and admin booking pages
- Booking status badges and summary counts

## [0.4.1] - 2026-02-12
### Fixed
- Date and time formatting inconsistencies in booking summaries
- Validation edge cases on time range inputs

## [0.5.0] - 2026-02-14
### Added
- Bulk booking group flow with per-room conflict feedback
- Improved empty states for cart and lists

## [0.5.1] - 2026-02-15
### Added
- Multi-date selection in date picker with Ctrl/Cmd toggle and Shift range
- Selected date list display in booking summary
### Fixed
- Payload now includes selected dates for non-contiguous bookings
