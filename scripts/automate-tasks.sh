#!/bin/bash
#
# automate-tasks.sh - Automated task execution using opencode
#
# This script automates the development workflow for mcpdf:
# 1. Reads PROGRESS.md to find pending tasks for a phase
# 2. For each task, runs 5 steps with opencode (fresh context each time)
# 3. Handles retries for quality checks
#
# Usage:
#   ./scripts/automate-tasks.sh <phase>
#   ./scripts/automate-tasks.sh 3        # Run all Phase 3 tasks
#   ./scripts/automate-tasks.sh 3.1      # Run single task 3.1
#
# Requirements:
#   - opencode installed and configured
#   - GITHUB_TOKEN set for Copilot authentication
#   - .opencode.json configured in project root

set -euo pipefail

# Configuration
MAX_RETRIES=7
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"
PROGRESS_FILE="$PROJECT_ROOT/context/PROGRESS.md"
COMMANDS_DIR="$SCRIPTS_DIR/opencode"
LOG_DIR="$PROJECT_ROOT/.opencode/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check opencode is installed
    if ! command -v opencode &> /dev/null; then
        log_error "opencode is not installed. Install with: brew install opencode-ai/tap/opencode"
        exit 1
    fi
    
    # Check PROGRESS.md exists
    if [[ ! -f "$PROGRESS_FILE" ]]; then
        log_error "PROGRESS.md not found at $PROGRESS_FILE"
        exit 1
    fi
    
    # Check commands directory exists
    if [[ ! -d "$COMMANDS_DIR" ]]; then
        log_error "Commands directory not found at $COMMANDS_DIR"
        exit 1
    fi
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    log_success "Prerequisites check passed"
}

# Extract tasks for a phase from PROGRESS.md
get_phase_tasks() {
    local phase="$1"
    
    # Extract task IDs matching the phase (e.g., "3" matches "3.1", "3.2", etc.)
    grep -E "^### Task ${phase}\.[0-9]+:" "$PROGRESS_FILE" | \
        sed -E 's/^### Task ([0-9]+\.[0-9]+):.*/\1/' || true
}

# Get task status from PROGRESS.md
get_task_status() {
    local task_id="$1"
    
    # Find the task section and extract status
    local status
    status=$(awk "/^### Task ${task_id}:/{found=1} found && /Status:/{print; exit}" "$PROGRESS_FILE" | \
        grep -oE '(⏳ Pending|🔄 In Progress|✅ Complete|❌ Blocked)' || echo "Unknown")
    
    echo "$status"
}

# Get task name from PROGRESS.md
get_task_name() {
    local task_id="$1"
    
    grep -E "^### Task ${task_id}:" "$PROGRESS_FILE" | \
        sed -E 's/^### Task [0-9]+\.[0-9]+: (.*)/\1/' || echo "Unknown Task"
}

# Run a single step with opencode
run_opencode_step() {
    local step_name="$1"
    local command_file="$2"
    local task_id="$3"
    local log_file="$4"
    
    log_info "Running step: $step_name for Task $task_id"
    
    # Read the command file
    local prompt
    prompt=$(cat "$command_file")
    
    # Add task context to the prompt
    local full_prompt="TASK_ID=${task_id}

${prompt}"
    
    # Run opencode in non-interactive mode using 'opencode run'
    # The model is configured in .opencode.json
    if opencode run "$full_prompt" >> "$log_file" 2>&1; then
        log_success "Step '$step_name' completed"
        return 0
    else
        log_error "Step '$step_name' failed"
        return 1
    fi
}

# Run execute step with retry logic for quality checks
run_execute_with_retry() {
    local task_id="$1"
    local log_file="$2"
    local attempt=1
    
    while [[ $attempt -le $MAX_RETRIES ]]; do
        log_info "Execution attempt $attempt/$MAX_RETRIES for Task $task_id"
        
        if run_opencode_step "execute-plan" "$COMMANDS_DIR/execute-plan.md" "$task_id" "$log_file"; then
            # Check if quality checks passed by looking at the log
            if grep -q "EXECUTION_COMPLETE" "$log_file" || grep -q "All checks pass" "$log_file"; then
                log_success "Execution completed with passing checks"
                return 0
            fi
        fi
        
        if [[ $attempt -lt $MAX_RETRIES ]]; then
            log_warning "Attempt $attempt failed, retrying... ($(($MAX_RETRIES - $attempt)) attempts remaining)"
            
            # Add a fix prompt for the next attempt
            local fix_prompt="TASK_ID=${task_id}

The previous execution attempt failed quality checks. 

Please:
1. Read the current state of the code
2. Run 'pnpm run check' to see what's failing
3. Fix the issues
4. Re-run 'pnpm run check' until all checks pass

Focus on fixing:
- Lint errors
- TypeScript errors  
- Failing tests

Once all checks pass, output: EXECUTION_COMPLETE: Task ${task_id}"
            
            opencode run "$fix_prompt" >> "$log_file" 2>&1 || true
        fi
        
        ((attempt++))
    done
    
    log_error "Execution failed after $MAX_RETRIES attempts"
    return 1
}

# Run review-changes with retry logic
run_review_with_retry() {
    local task_id="$1"
    local log_file="$2"
    local attempt=1
    
    while [[ $attempt -le $MAX_RETRIES ]]; do
        log_info "Review attempt $attempt/$MAX_RETRIES for Task $task_id"
        
        if run_opencode_step "review-changes" "$COMMANDS_DIR/review-changes.md" "$task_id" "$log_file"; then
            if grep -q "REVIEW_COMPLETE" "$log_file"; then
                log_success "Review completed successfully"
                return 0
            fi
        fi
        
        if [[ $attempt -lt $MAX_RETRIES ]]; then
            log_warning "Review found issues, attempting to fix..."
            
            local fix_prompt="TASK_ID=${task_id}

The code review found issues. Please:
1. Run 'pnpm run check' to see current status
2. Fix any remaining issues
3. Ensure all tests pass
4. Update PROGRESS.md with task completion

Once everything passes, output: REVIEW_COMPLETE: Task ${task_id}"
            
            opencode run "$fix_prompt" >> "$log_file" 2>&1 || true
        fi
        
        ((attempt++))
    done
    
    log_error "Review failed after $MAX_RETRIES attempts"
    return 1
}

# Process a single task through all 5 steps
process_task() {
    local task_id="$1"
    local task_name
    task_name=$(get_task_name "$task_id")
    
    log_step "Processing Task $task_id: $task_name"
    
    # Create log file for this task
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local log_file="$LOG_DIR/task_${task_id}_${timestamp}.log"
    
    log_info "Logging to: $log_file"
    
    # Check if task is already complete
    local status
    status=$(get_task_status "$task_id")
    
    if [[ "$status" == "✅ Complete" ]]; then
        log_warning "Task $task_id is already complete, skipping"
        return 0
    fi
    
    if [[ "$status" == "❌ Blocked" ]]; then
        log_error "Task $task_id is blocked, skipping"
        return 1
    fi
    
    # Step 1: Prepare Plan
    log_step "Step 1/5: Prepare Plan"
    if ! run_opencode_step "prepare-plan" "$COMMANDS_DIR/prepare-plan.md" "$task_id" "$log_file"; then
        log_error "Failed to prepare plan for Task $task_id"
        return 1
    fi
    
    # Step 2: Review Plan  
    log_step "Step 2/5: Review Plan"
    if ! run_opencode_step "review-plan" "$COMMANDS_DIR/review-plan.md" "$task_id" "$log_file"; then
        log_error "Plan review failed for Task $task_id"
        return 1
    fi
    
    # Step 3: Execute Plan (with retries)
    log_step "Step 3/5: Execute Plan"
    if ! run_execute_with_retry "$task_id" "$log_file"; then
        log_error "Execution failed for Task $task_id after $MAX_RETRIES attempts"
        return 1
    fi
    
    # Step 4: Review Changes (with retries)
    log_step "Step 4/5: Review Changes"
    if ! run_review_with_retry "$task_id" "$log_file"; then
        log_error "Review failed for Task $task_id after $MAX_RETRIES attempts"
        return 1
    fi
    
    # Step 5: Commit and Push
    log_step "Step 5/5: Commit and Push"
    if ! run_opencode_step "commit-and-push" "$COMMANDS_DIR/commit-and-push.md" "$task_id" "$log_file"; then
        log_error "Commit failed for Task $task_id"
        return 1
    fi
    
    log_success "Task $task_id completed successfully!"
    log_info "Full log available at: $log_file"
    
    return 0
}

# Main execution
main() {
    local target="$1"
    
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     mcpdf Automated Task Execution with OpenCode           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    
    cd "$PROJECT_ROOT"
    
    check_prerequisites
    
    # Determine if running single task or full phase
    if [[ "$target" =~ ^[0-9]+\.[0-9]+$ ]]; then
        # Single task (e.g., "3.1")
        log_info "Running single task: $target"
        process_task "$target"
    else
        # Full phase (e.g., "3")
        log_info "Running all pending tasks for Phase $target"
        
        local tasks
        tasks=$(get_phase_tasks "$target")
        
        if [[ -z "$tasks" ]]; then
            log_error "No tasks found for Phase $target"
            exit 1
        fi
        
        local completed=0
        local failed=0
        local skipped=0
        
        for task_id in $tasks; do
            local status
            status=$(get_task_status "$task_id")
            
            if [[ "$status" == "✅ Complete" ]]; then
                log_warning "Skipping Task $task_id (already complete)"
                ((skipped++))
                continue
            fi
            
            if process_task "$task_id"; then
                ((completed++))
            else
                ((failed++))
                log_error "Task $task_id failed, stopping phase execution"
                break
            fi
        done
        
        echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}Phase $target Summary:${NC}"
        echo -e "  Completed: $completed"
        echo -e "  Failed:    $failed"
        echo -e "  Skipped:   $skipped"
        echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"
        
        if [[ $failed -gt 0 ]]; then
            exit 1
        fi
    fi
}

# Show usage
usage() {
    echo "Usage: $0 <phase|task_id>"
    echo ""
    echo "Examples:"
    echo "  $0 3       # Run all pending tasks in Phase 3"
    echo "  $0 3.1     # Run only Task 3.1"
    echo "  $0 2.5     # Run only Task 2.5"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "The script will:"
    echo "  1. Find pending tasks for the specified phase/task"
    echo "  2. For each task, run 5 steps with fresh opencode sessions:"
    echo "     - prepare-plan: Create implementation plan"
    echo "     - review-plan: Validate the plan"
    echo "     - execute-plan: Implement the code (with $MAX_RETRIES retries)"
    echo "     - review-changes: Verify implementation (with $MAX_RETRIES retries)"
    echo "     - commit-and-push: Commit and push changes"
    echo "  3. Each step runs in a separate opencode session for fresh context"
    echo ""
    echo "Logs are saved to: .opencode/logs/"
}

# Entry point
if [[ $# -lt 1 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    usage
    exit 0
fi

main "$1"
