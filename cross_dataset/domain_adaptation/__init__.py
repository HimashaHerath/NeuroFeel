"""
Domain adaptation modules.
"""

from .coral import coral_transform, calculate_domain_discrepancy
from .subspace import subspace_alignment, calculate_subspace_error
from .ensemble import ensemble_domain_adaptation, measure_domain_gap

__all__ = [
    'coral_transform', 'calculate_domain_discrepancy',
    'subspace_alignment', 'calculate_subspace_error',
    'ensemble_domain_adaptation', 'measure_domain_gap'
]