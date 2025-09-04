app
.controller('DrawerCtrl', ['$scope', "asyncValidator", function ExperimentalCtrl($scope, asyncValidator) {
    const _that = this

    // Drawer state
    this.drawerModel = false
    this.drawerDirection = 'rtl'
    this.drawerSize = '50%'
    this.drawerTitle = 'Default Title'
    this.drawerWithHeader = true
    this.drawerWithFooter = false

    // Form data
    this.formData = {
        name: '',
        email: '',
        message: ''
    }

    // Original model (keeping existing functionality)
    this.model = {
        num: '',
        result: ''
    }

    this.inputChange = function() {
        // Existing functionality
    }

    // Drawer methods
    this.openDrawer = function(direction) {
        this.drawerDirection = direction
        this.drawerSize = '50%'
        this.drawerTitle = `${direction.toUpperCase()} Drawer`
        this.drawerWithHeader = true
        this.drawerWithFooter = false
        this.drawerModel =  !this.drawerModel
    }

    this.openDrawerWithSize = function(direction, size) {
        this.drawerDirection = direction
        this.drawerSize = size
        this.drawerTitle = `${size.charAt(0).toUpperCase() + size.slice(1)} ${direction.toUpperCase()} Drawer`
        this.drawerWithHeader = true
        this.drawerWithFooter = false
        this.drawerModel = true
    }

    this.openDrawerWithFooter = function() {
        this.drawerDirection = 'rtl'
        this.drawerSize = '50%'
        this.drawerTitle = 'Drawer with Footer'
        this.drawerWithHeader = true
        this.drawerWithFooter = true
        this.drawerModel = true
    }

    this.openDrawerWithoutHeader = function() {
        this.drawerDirection = 'rtl'
        this.drawerSize = '50%'
        this.drawerTitle = ''
        this.drawerWithHeader = false
        this.drawerWithFooter = false
        this.drawerModel = true
    }

    this.closeDrawer = function() {
        this.drawerModel = false
    }

    this.onDrawerOpen = function() {
        // console.log('Drawer opened')
    }

    this.onDrawerClose = function() {
        // console.log('Drawer closed')
    }

    this.saveForm = function() {
        console.log('Form data:', this.formData)
        alert('Form saved! Check console for data.')
        this.closeDrawer()
    }
}])
